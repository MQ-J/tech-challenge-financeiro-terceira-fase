import { auth } from '@/firebase/config'
import { db } from '@/lib/firebase'
import type { FirestoreUserProfile } from '@/lib/types'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

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

  const value = useMemo(() => ({ signUp }), [signUp])

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
