import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Account, Transaction } from '@/lib/types'
import { mockAccounts } from '@/lib/mock-data'
import { getSecureItem, removeSecureItem, setSecureItem } from '@/lib/storage'

interface AccountContextType {
  account: Account | null
  login: (accountData: Account) => Promise<void>
  logout: () => Promise<void>
  addTransaction: (transactionData: Omit<Transaction, 'id'>) => void
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
      const storedAccount = await getSecureItem<Account>('currentAccount')
      if (storedAccount) {
        setAccount(storedAccount)
      }
      setIsHydrated(true)
    }
    void hydrate()
  }, [])

  useEffect(() => {
    if (!account) return

    const persist = async () => {
      await setSecureItem('currentAccount', account)

      let list: Account[] = []
      try {
        const storedList = (await getSecureItem<Account[]>('accountsList')) || []
        if (!Array.isArray(storedList) || storedList.length === 0) {
          list = mockAccounts
        } else {
          list = storedList
        }
      } catch {
        list = mockAccounts
      }

      const updatedList = list.map((acc) =>
        acc.accountNumber === account.accountNumber ? account : acc,
      )
      await setSecureItem('accountsList', updatedList)
    }

    void persist()
  }, [account])

  const login = async (accountData: Account) => {
    setAccount(accountData)
  }

  const logout = async () => {
    setAccount(null)
    await removeSecureItem('currentAccount')
  }

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    setAccount((prev) => {
      if (!prev) return prev
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      }
      return {
        ...prev,
        balance: prev.balance + newTransaction.amount,
        transactions: [newTransaction, ...prev.transactions],
      }
    })
  }

  const updateTransaction = (
    id: string,
    updatedData: Partial<Omit<Transaction, 'id'>>,
  ) => {
    setAccount((prev) => {
      if (!prev) return prev
      const transactions = prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updatedData, id } : t,
      )
      return {
        ...prev,
        transactions,
      }
    })
  }

  const deleteTransaction = (id: string) => {
    setAccount((prev) => {
      if (!prev) return prev
      const transactions = prev.transactions.filter((t) => t.id !== id)
      return {
        ...prev,
        transactions,
      }
    })
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

