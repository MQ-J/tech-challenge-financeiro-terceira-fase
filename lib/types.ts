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
  /** Firebase Auth UID — preenchido após login; usado para `users/{uid}` no Firestore. */
  uid?: string
  balance: number
  accountNumber: string
  userName: string
  email: string
  transactions: Transaction[]
}

/** Documento `users/{uid}` no Firestore (mesma forma que `Account` no app). */
export type FirestoreUserProfile = Account

