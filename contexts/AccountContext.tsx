import { auth } from '@/firebase/config'
import {
  addTransactionDoc,
  deleteTransactionDoc,
  fetchAllTransactions,
  updateTransactionDoc,
  updateUserProfileFinancials,
  type TransactionDocUpdate,
} from '@/lib/firestore'
import { deleteReceiptFromFirebaseIfPresent } from '@/lib/receipt-storage'
import { fetchUserAccountDocument } from '@/lib/user-account-from-firestore'
import { removeSecureItem, setSecureItem } from '@/lib/storage'
import type { Account, Transaction } from '@/lib/types'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

interface AccountContextType {
  account: Account | null
  login: (accountData: Account) => Promise<void>
  logout: () => Promise<void>
  addTransaction: (transactionData: Omit<Transaction, 'id'>, presetId?: string) => void
  updateTransaction: (id: string, updatedData: TransactionDocUpdate) => void
  deleteTransaction: (id: string) => void
  isHydrated: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

async function mergeWithSubcollectionTransactions(
  accountData: Account,
): Promise<Account> {
  try {
    const transactions = await fetchAllTransactions(accountData.accountNumber)
    if (transactions.length > 0) {
      const balance = transactions.reduce((sum, t) => sum + t.amount, 0)
      return { ...accountData, transactions, balance }
    }
    return {
      ...accountData,
      transactions: accountData.transactions ?? [],
      balance: accountData.balance,
    }
  } catch {
    return {
      ...accountData,
      transactions: accountData.transactions ?? [],
      balance: accountData.balance,
    }
  }
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

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
        const merged = await mergeWithSubcollectionTransactions(base)
        if (cancelled) return
        setAccount(merged)
        const { transactions: _, ...meta } = merged
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
    try {
      const merged = await mergeWithSubcollectionTransactions(withUid)
      setAccount(merged)
      const { transactions: _, ...meta } = merged
      await setSecureItem('currentAccount', meta)
    } catch {
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              transactions: withUid.transactions,
              balance: withUid.balance,
            }
          : prev,
      )
    }
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
        await updateUserProfileFinancials(
          uid,
          next.balance,
          next.transactions,
        )
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
      transactions: [newTransaction, ...account.transactions],
    }

    setAccount(next)
    void syncFirebaseAfterMutation(next, () =>
      addTransactionDoc(account.accountNumber, newTransaction),
    )
    Toast.show({
      type: 'success',
      text1: 'Transação adicionada com sucesso',
    })
  }

  const updateTransaction = (id: string, updatedData: TransactionDocUpdate) => {
    if (!account) return

    const transactionToUpdate = account.transactions.find((t) => t.id === id)
    if (!transactionToUpdate) return

    const prevReceiptUrl = transactionToUpdate.receiptUrl
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

    const oldAmount = transactionToUpdate.amount
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

    let balanceDiff = 0
    const newTransactions = account.transactions.map((t) => {
      if (t.id !== id) return t

      const prevAmount = t.amount
      const nextAmount = updatedData.amount ?? prevAmount
      balanceDiff = nextAmount - prevAmount

      const { receiptUrl: patchReceipt, ...patchRest } = updatedData
      const mergedBase: Transaction = { ...t, ...patchRest, id }

      if (patchReceipt === null) {
        const { receiptUrl: _removed, ...rest } = mergedBase
        return rest
      }
      if (typeof patchReceipt === 'string') {
        return { ...mergedBase, receiptUrl: patchReceipt }
      }
      return mergedBase
    })

    const next: Account = {
      ...account,
      balance: account.balance + balanceDiff,
      transactions: newTransactions,
    }

    setAccount(next)
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

  const deleteTransaction = (id: string) => {
    if (!account) return

    const transactionToDelete = account.transactions.find((t) => t.id === id)
    if (!transactionToDelete) return

    const receiptUrlToDelete = transactionToDelete.receiptUrl

    const next: Account = {
      ...account,
      balance: account.balance - transactionToDelete.amount,
      transactions: account.transactions.filter((t) => t.id !== id),
    }

    setAccount(next)
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
