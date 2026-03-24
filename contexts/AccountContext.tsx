import { auth } from '@/firebase/config'
import {
    addTransactionDoc,
    deleteTransactionDoc,
    updateTransactionDoc,
    updateUserProfileFinancials,
    type TransactionDocUpdate,
} from '@/lib/firestore'
import { deleteReceiptFromFirebaseIfPresent } from '@/lib/receipt-storage'
import { removeSecureItem, setSecureItem } from '@/lib/storage'
import type { Account, Transaction } from '@/lib/types'
import { fetchUserAccountDocument } from '@/lib/user-account-from-firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

interface AccountContextType {
  account: Account | null
  login: (accountData: Account) => Promise<void>
  logout: () => Promise<void>
  addTransaction: (transactionData: Omit<Transaction, 'id'>, presetId?: string) => void
  updateTransaction: (id: string, updatedData: TransactionDocUpdate, oldTransaction: Transaction) => void
  deleteTransaction: (id: string, transaction: Transaction) => void
  isHydrated: boolean
  mutationVersion: number
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [mutationVersion, setMutationVersion] = useState(0)

  useEffect(() => {
    void removeSecureItem('accountsList')
  }, [])

  useEffect(() => {
    let cancelled = false
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return

      if (!user) {
        setAccount(null)
        await removeSecureItem('currentAccount')
        setIsHydrated(true)
        return
      }

      try {
        const base = await fetchUserAccountDocument(
          user.uid,
          user.email ?? '',
        )
        if (cancelled) return
        setAccount({ ...base, transactions: [] })
        const { transactions: _, ...meta } = base
        await setSecureItem('currentAccount', meta)
      } catch {
        if (!cancelled) setAccount(null)
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  // Espelha conta logada no storage (sem lista de transações) — só controle de sessão local.
  useEffect(() => {
    const persist = async () => {
      if (account === null) {
        return
      }
      const { transactions: _, ...meta } = account
      await setSecureItem('currentAccount', meta)
    }
    void persist()
  }, [account])

  const login = async (accountData: Account) => {
    const uid = accountData.uid ?? auth.currentUser?.uid
    const withUid = uid ? { ...accountData, uid } : accountData
    setAccount({ ...withUid, transactions: [] })
    const { transactions: _, ...meta } = withUid
    await setSecureItem('currentAccount', meta)
  }

  const logout = async () => {
    setAccount(null)
    await removeSecureItem('currentAccount')
    try {
      await signOut(auth)
    } catch {
      /* sessão já encerrada */
    }
  }

  const syncFirebaseAfterMutation = async (
    next: Account,
    subcollectionOp: () => Promise<void>,
    afterSuccess?: () => Promise<void>,
  ) => {
    const uid = next.uid ?? auth.currentUser?.uid
    try {
      await subcollectionOp()
      if (uid) {
        await updateUserProfileFinancials(uid, next.balance)
      }
      await afterSuccess?.()
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro ao sincronizar',
        text2: 'Não foi possível salvar no Firebase. Verifique conexão e regras.',
      })
    }
  }

  const addTransaction = (
    transactionData: Omit<Transaction, 'id'>,
    presetId?: string,
  ) => {
    if (!account) return

    const newTransaction: Transaction = {
      ...transactionData,
      id: presetId ?? Date.now().toString(),
    }

    if (
      newTransaction.amount < 0 &&
      account.balance + newTransaction.amount < 0
    ) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: 'Você não possui saldo suficiente para realizar esta operação.',
      })
      return
    }

    const next: Account = {
      ...account,
      balance: account.balance + newTransaction.amount,
      transactions: [],
    }

    setAccount(next)
    setMutationVersion((v) => v + 1)
    void syncFirebaseAfterMutation(next, () =>
      addTransactionDoc(account.accountNumber, newTransaction),
    )
    Toast.show({
      type: 'success',
      text1: 'Transação adicionada com sucesso',
    })
  }

  const updateTransaction = (id: string, updatedData: TransactionDocUpdate, oldTransaction: Transaction) => {
    if (!account) return

    const prevReceiptUrl = oldTransaction.receiptUrl
    const oldFirebaseReceipt =
      prevReceiptUrl?.includes('firebasestorage.googleapis.com') === true
        ? prevReceiptUrl
        : null
    let deleteOldReceiptAfterSync = false
    if (oldFirebaseReceipt) {
      if (updatedData.receiptUrl === null) {
        deleteOldReceiptAfterSync = true
      } else if (
        typeof updatedData.receiptUrl === 'string' &&
        updatedData.receiptUrl !== oldFirebaseReceipt
      ) {
        deleteOldReceiptAfterSync = true
      }
    }

    const oldAmount = oldTransaction.amount
    const newAmount = updatedData.amount ?? oldAmount
    const balanceDifference = newAmount - oldAmount
    const potentialNewBalance = account.balance + balanceDifference

    if (potentialNewBalance < 0) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: 'Você não possui saldo suficiente para realizar esta operação.',
      })
      return
    }

    const next: Account = {
      ...account,
      balance: account.balance + balanceDifference,
      transactions: [],
    }

    setAccount(next)
    setMutationVersion((v) => v + 1)
    void syncFirebaseAfterMutation(
      next,
      () => updateTransactionDoc(account.accountNumber, id, updatedData),
      deleteOldReceiptAfterSync
        ? () => deleteReceiptFromFirebaseIfPresent(oldFirebaseReceipt)
        : undefined,
    )
    Toast.show({
      type: 'success',
      text1: 'Transação atualizada com sucesso',
    })
  }

  const deleteTransaction = (id: string, transaction: Transaction) => {
    if (!account) return

    const receiptUrlToDelete = transaction.receiptUrl

    const next: Account = {
      ...account,
      balance: account.balance - transaction.amount,
      transactions: [],
    }

    setAccount(next)
    setMutationVersion((v) => v + 1)
    void syncFirebaseAfterMutation(
      next,
      () => deleteTransactionDoc(account.accountNumber, id),
      receiptUrlToDelete
        ? () => deleteReceiptFromFirebaseIfPresent(receiptUrlToDelete)
        : undefined,
    )
  }

  return (
    <AccountContext.Provider
      value={{
        account,
        login,
        logout,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isHydrated,
        mutationVersion,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
