import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import {
  type Auth,
  type Persistence,
  getAuth,
  initializeAuth,
} from 'firebase/auth'
import { Platform } from 'react-native'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBhCsLP-s4Wa0nWMI3HAr6p6khsO5tIuRc',
  authDomain: 'tech-challenge-terceira-fase.firebaseapp.com',
  projectId: 'tech-challenge-terceira-fase',
  storageBucket: 'tech-challenge-terceira-fase.firebasestorage.app',
  messagingSenderId: '518012524783',
  appId: '1:518012524783:web:4b2b864e88e0b04443231a',
  measurementId: 'G-H971JBK7JT',
}

let app: FirebaseApp
let auth: Auth

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  if (Platform.OS === 'web') {
    auth = getAuth(app)
  } else {
    // Metro resolve @firebase/auth para o bundle RN (inclui getReactNativePersistence).
    // Os tipos do pacote `firebase/auth` no TS às vezes não expõem esse helper.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nativeAuth = require('@firebase/auth') as {
      initializeAuth: typeof initializeAuth
      getReactNativePersistence: (
        storage: typeof ReactNativeAsyncStorage,
      ) => Persistence
    }
    auth = nativeAuth.initializeAuth(app, {
      persistence: nativeAuth.getReactNativePersistence(ReactNativeAsyncStorage),
    })
  }
} else {
  app = getApp()
  auth = getAuth(app)
}

export { app, auth }
