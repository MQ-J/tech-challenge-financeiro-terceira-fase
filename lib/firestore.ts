import { db } from '@/lib/firebase'
import type { Transaction, TransactionType } from '@/lib/types'
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    startAfter,
    updateDoc,
    where,
    type DocumentData,
    type QueryDocumentSnapshot,
} from 'firebase/firestore'

function transactionForUserDoc(t: Transaction): Record<string, unknown> {
  const o: Record<string, unknown> = {
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
  }
  if (t.description !== undefined) o.description = t.description
  if (t.receiptUrl !== undefined) o.receiptUrl = t.receiptUrl
  return o
}

/** Atualiza saldo e espelho de transações em `users/{uid}` (além da subcoleção `accounts/.../transactions`). */
export async function updateUserProfileFinancials(
  uid: string,
  balance: number,
  transactions: Transaction[],
): Promise<void> {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    balance,
    transactions: transactions.map(transactionForUserDoc),
  })
}

const PAGE_SIZE = 20

export interface TransactionFilters {
  type?: TransactionType | 'todos'
  dateFrom?: string // ISO date string YYYY-MM-DD
  dateTo?: string   // ISO date string YYYY-MM-DD
}

export interface FetchTransactionsResult {
  transactions: Transaction[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

function transactionsCol(accountNumber: string) {
  return collection(db, 'accounts', accountNumber, 'transactions')
}

export async function fetchTransactions(
  accountNumber: string,
  filters: TransactionFilters = {},
  cursorDoc: QueryDocumentSnapshot<DocumentData> | null = null,
): Promise<FetchTransactionsResult> {
  const col = transactionsCol(accountNumber)

  const constraints: Parameters<typeof query>[1][] = [orderBy('date', 'desc'), limit(PAGE_SIZE + 1)]

  if (filters.type && filters.type !== 'todos') {
    constraints.unshift(where('type', '==', filters.type))
  }
  if (filters.dateFrom) {
    constraints.unshift(where('date', '>=', filters.dateFrom))
  }
  if (filters.dateTo) {
    constraints.unshift(where('date', '<=', filters.dateTo))
  }
  if (cursorDoc) {
    constraints.push(startAfter(cursorDoc))
  }

  const q = query(col, ...constraints)
  const snapshot = await getDocs(q)
  const docs = snapshot.docs

  const hasMore = docs.length > PAGE_SIZE
  const pageDocs = hasMore ? docs.slice(0, PAGE_SIZE) : docs
  const lastDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null

  const transactions: Transaction[] = pageDocs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Transaction, 'id'>),
  }))

  return { transactions, lastDoc, hasMore }
}

export async function fetchAllTransactions(accountNumber: string): Promise<Transaction[]> {
  const col = transactionsCol(accountNumber)
  const q = query(col, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Transaction, 'id'>),
  }))
}

export async function addTransactionDoc(
  accountNumber: string,
  transaction: Transaction,
): Promise<void> {
  const { id, ...data } = transaction
  await setDoc(doc(transactionsCol(accountNumber), id), data)
}

export async function updateTransactionDoc(
  accountNumber: string,
  id: string,
  data: Partial<Omit<Transaction, 'id'>>,
): Promise<void> {
  await updateDoc(doc(transactionsCol(accountNumber), id), data)
}

export async function deleteTransactionDoc(
  accountNumber: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(transactionsCol(accountNumber), id))
}
