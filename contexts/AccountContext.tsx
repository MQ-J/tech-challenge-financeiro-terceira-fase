import { auth } from '@/firebase/config'
import { addTransactionDoc, deleteTransactionDoc, fetchAllTransactions, updateTransactionDoc } from '@/lib/firestore'
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/storage'
import { signOut } from 'firebase/auth'
import type { Account, Transaction } from '@/lib/types'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

type AccountMeta = Omit<Account, 'transactions'>

interface AccountContextType {
  account: Account | null
  login: (accountData: Account) => Promise<void>
  logout: () => Promise<void>
  addTransaction: (transactionData: Omit<Transaction, 'id'>, presetId?: string) => void
  updateTransaction: (
    id: string,
    updatedData: Partial<Omit<Transaction, 'id'>>,
  ) => void
  deleteTransaction: (id: string) => void
  isHydrated: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const hydrate = async () => {
      const storedMeta = await getSecureItem<AccountMeta>('currentAccount')
      if (storedMeta) {
        setAccount({ ...storedMeta, transactions: [] })
        try {
          const transactions = await fetchAllTransactions(storedMeta.accountNumber)
          if (transactions.length > 0) {
            const balance = transactions.reduce((sum, t) => sum + t.amount, 0)
            setAccount((prev) => (prev ? { ...prev, transactions, balance } : prev))
          }
          // lista vazia: mantém saldo/transações já persistidos em `currentAccount` se houver
        } catch {}
      }
      setIsHydrated(true)
    }
    void hydrate()
  }, [])

  // Sempre que a conta mudar, persistir currentAccount e sincronizar accountsList
  useEffect(() => {
    const persist = async () => {
      if (account === null) {
        return
      }

      const { transactions: _, ...meta } = account
      await setSecureItem('currentAccount', meta)

      let list: AccountMeta[] = []
      try {
        const storedList = await getSecureItem<AccountMeta[]>('accountsList')
        list = Array.isArray(storedList) ? storedList : []
      } catch {
        list = []
      }

      const exists = list.some((acc) => acc.accountNumber === account.accountNumber)
      const updatedList = exists
        ? list.map((acc) => acc.accountNumber === account.accountNumber ? meta : acc)
        : [...list, meta]

      await setSecureItem('accountsList', updatedList)
    }

    void persist()
  }, [account])

  const login = async (accountData: Account) => {
    setAccount({ ...accountData, transactions: [] })
    try {
      const transactions = await fetchAllTransactions(accountData.accountNumber)
      if (transactions.length > 0) {
        const balance = transactions.reduce((sum, t) => sum + t.amount, 0)
        setAccount((prev) => (prev ? { ...prev, transactions, balance } : prev))
      } else {
        // Sem docs em `accounts/{accountNumber}/transactions`: usa perfil do Firestore (`users/{uid}`)
        setAccount((prev) =>
          prev
            ? {
                ...prev,
                transactions: accountData.transactions,
                balance: accountData.balance,
              }
            : prev,
        )
      }
    } catch {
      setAccount((prev) =>
        prev
          ? { ...prev, transactions: accountData.transactions, balance: accountData.balance }
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
      /* sessão já encerrada ou sem Firebase */
    }
  }

  const addTransaction = (transactionData: Omit<Transaction, 'id'>, presetId?: string) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: presetId ?? Date.now().toString(),
    }
    if (account && newTransaction.amount < 0 && account.balance + newTransaction.amount < 0) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: 'Você não possui saldo suficiente para realizar esta operação.',
      })
      return
    }
    setAccount((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        balance: prev.balance + newTransaction.amount,
        transactions: [newTransaction, ...prev.transactions],
      }
    })
    if (account) {
      addTransactionDoc(account.accountNumber, newTransaction).catch(() => {})
    }
    Toast.show({
      type: 'success',
      text1: 'Transação adicionada com sucesso',
    })
  }

  const updateTransaction = (
    id: string,
    updatedData: Partial<Omit<Transaction, 'id'>>,
  ) => {
    const currentAccount = account
    if (!currentAccount) return
    const transactionToUpdate = currentAccount.transactions.find((t) => t.id === id)
    if (!transactionToUpdate) return
    const oldAmount = transactionToUpdate.amount
    const newAmount = updatedData.amount ?? oldAmount
    const balanceDifference = newAmount - oldAmount
    const potentialNewBalance = currentAccount.balance + balanceDifference
    if (potentialNewBalance < 0) {
      Toast.show({
        type: 'error',
        text1: 'Saldo insuficiente',
        text2: 'Você não possui saldo suficiente para realizar esta operação.',
      })
      return
    }
    setAccount((prev) => {
      if (!prev) return prev
      let balanceDiff = 0
      const newTransactions = prev.transactions.map((t) => {
        if (t.id === id) {
          const prevAmount = t.amount
          const nextAmount = updatedData.amount ?? prevAmount
          balanceDiff = nextAmount - prevAmount
          return { ...t, ...updatedData, id }
        }
        return t
      })
      return {
        ...prev,
        balance: prev.balance + balanceDiff,
        transactions: newTransactions,
      }
    })
    if (account) {
      updateTransactionDoc(account.accountNumber, id, updatedData).catch(() => {})
    }
    Toast.show({
      type: 'success',
      text1: 'Transação atualizada com sucesso',
    })
  }

  const deleteTransaction = (id: string) => {
    setAccount((prev) => {
      if (!prev) return prev
      const transactionToDelete = prev.transactions.find((t) => t.id === id)
      if (!transactionToDelete) return prev
      const newTransactions = prev.transactions.filter((t) => t.id !== id)
      const newBalance = prev.balance - transactionToDelete.amount
      return {
        ...prev,
        balance: newBalance,
        transactions: newTransactions,
      }
    })
    if (account) {
      deleteTransactionDoc(account.accountNumber, id).catch(() => {})
    }
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

