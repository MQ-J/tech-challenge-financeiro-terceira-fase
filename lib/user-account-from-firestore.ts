import { db } from '@/lib/firebase'
import type { Account } from '@/lib/types'
import { doc, getDoc } from 'firebase/firestore'

/** Monta `Account` a partir do documento `users/{uid}` + `uid` do Auth. */
export function mapFirestoreProfileToAccount(
  emailFromAuth: string,
  data: Partial<Account> | undefined,
  uid: string,
): Account {
  if (!data || Object.keys(data).length === 0) {
    return {
      balance: 0,
      accountNumber: '0000-0',
      userName: emailFromAuth.split('@')[0] || 'Usuário',
      email: emailFromAuth,
      transactions: [],
      uid,
    }
  }

  const transactions = Array.isArray(data.transactions) ? data.transactions : []

  return {
    balance: typeof data.balance === 'number' ? data.balance : 0,
    accountNumber:
      typeof data.accountNumber === 'string' ? data.accountNumber : '0000-0',
    userName: typeof data.userName === 'string' ? data.userName : 'Usuário',
    email:
      typeof data.email === 'string' && data.email.length > 0
        ? data.email
        : emailFromAuth,
    transactions,
    uid,
  }
}

export async function fetchUserAccountDocument(
  uid: string,
  emailFallback: string,
): Promise<Account> {
  const snap = await getDoc(doc(db, 'users', uid))
  const profile = snap.exists() ? (snap.data() as Partial<Account>) : undefined
  return mapFirestoreProfileToAccount(emailFallback, profile, uid)
}
