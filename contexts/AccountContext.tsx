import React, { createContext, useContext, useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
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

  // Sempre que a conta mudar, persistir currentAccount e sincronizar accountsList
  useEffect(() => {
    const persist = async () => {
      if (account === null) {
        return
      }

      // Salvar conta atual
      await setSecureItem('currentAccount', account)

      // Sincronizar lista de contas
      let list: Account[] = []
      try {
        const storedList =
          (await getSecureItem<Account[]>('accountsList')) || []
        if (!Array.isArray(storedList) || storedList.length === 0) {
          list = mockAccounts
        } else {
          list = storedList
        }
      } catch {
        list = mockAccounts
      }

      const exists = list.some(
        (acc) => acc.accountNumber === account.accountNumber,
      )
      const updatedList = exists
        ? list.map((acc) =>
            acc.accountNumber === account.accountNumber ? account : acc,
          )
        : [...list, account]

      await setSecureItem('accountsList', updatedList)
    }

    void persist()
  }, [account])

  const login = async (accountData: Account) => {
    // Atualiza o estado em memória; efeito acima se encarrega de persistir
    setAccount(accountData)
  }

  const logout = async () => {
    setAccount(null)
    await removeSecureItem('currentAccount')
  }

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
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

