export type TransactionType = 'deposito' | 'transferencia' | 'pagamento' | 'saque'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  description?: string
  receiptUrl?: string
}

export interface Account {
  balance: number
  accountNumber: string
  userName: string
  email: string
  /** Uso em mocks / fluxo local; nunca persistir no Firestore (a senha fica só no Firebase Auth). */
  password: string
  transactions: Transaction[]
}

/** Documento `users/{uid}` no Firestore — alinhado a `Account`, exceto senha. */
export type FirestoreUserProfile = Omit<Account, 'password'>

