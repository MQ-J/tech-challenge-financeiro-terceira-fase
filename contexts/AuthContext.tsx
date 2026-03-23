import { auth } from '@/firebase/config'
import { db } from '@/lib/firebase'
import type { Account, FirestoreUserProfile } from '@/lib/types'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useRouter } from 'expo-router'
import React, { createContext, useCallback, useContext, useMemo } from 'react'

type SignUpMeta = {
  /** Nome completo — gravado em Firestore `users/{uid}` para o desafio. */
  userName?: string
  /** Chamado após sucesso no Auth/Firestore e antes de `router.replace` (fecha modal, etc.). */
  onRegistered?: () => void
}

type AuthContextValue = {
  signUp: (
    email: string,
    password: string,
    meta?: SignUpMeta,
  ) => Promise<void>
  /** Firebase Auth + perfil `users/{uid}`. Lança `FirebaseError` em falha. */
  signIn: (email: string, password: string) => Promise<Account>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Evita travar o cadastro se o Firestore não existir ou ficar em retentativa infinita. */
const FIRESTORE_PROFILE_TIMEOUT_MS = 12_000

async function saveUserProfileToFirestore(
  uid: string,
  userName: string,
  email: string,
): Promise<void> {
  const randomNumber = Math.floor(Math.random() * 10000)
  const accountNumber = randomNumber.toString().padStart(4, '0') + '-1'
  const ref = doc(db, 'users', uid)
  const payload: FirestoreUserProfile = {
    userName,
    email,
    accountNumber,
    balance: 0,
    transactions: [],
  }

  try {
    await Promise.race([
      setDoc(ref, payload),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              'Timeout: verifique se o Cloud Firestore foi criado no Firebase Console.',
            ),
          )
        }, FIRESTORE_PROFILE_TIMEOUT_MS)
      }),
    ])
  } catch (e) {
    console.log(
      'AuthProvider :: signUp - perfil não gravado no Firestore (usuário já existe no Auth). Crie o banco em Build → Firestore Database.',
      e,
    )
  }
}

function firestoreProfileToAccount(
  emailFromAuth: string,
  data: Partial<FirestoreUserProfile> | undefined,
): Account {
  if (!data || Object.keys(data).length === 0) {
    return {
      balance: 0,
      accountNumber: '0000-0',
      userName: emailFromAuth.split('@')[0] || 'Usuário',
      email: emailFromAuth,
      transactions: [],
    }
  }

  const transactions = Array.isArray(data.transactions)
    ? data.transactions
    : []

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
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim()
    const cred = await signInWithEmailAndPassword(
      auth,
      trimmedEmail,
      password,
    )
    const uid = cred.user.uid
    const emailResolved = cred.user.email ?? trimmedEmail

    const snap = await getDoc(doc(db, 'users', uid))
    const profile = snap.exists()
      ? (snap.data() as Partial<FirestoreUserProfile>)
      : undefined
    return firestoreProfileToAccount(emailResolved, profile)
  }, [])

  const signUp = useCallback(
    (email: string, password: string, meta?: SignUpMeta) => {
      return createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          console.log(
            'AuthProvider :: signUp - usuário cadastrado com sucesso',
          )
          const uid = userCredential.user.uid

          if (meta?.userName) {
            await saveUserProfileToFirestore(uid, meta.userName, email)
          }

          meta?.onRegistered?.()
          router.replace('/login')
        })
        .catch((err: unknown) => {
          console.log('AuthProvider :: signUp - falha', err)
          throw err
        })
    },
    [router],
  )

  const value = useMemo(() => ({ signUp, signIn }), [signUp, signIn])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
