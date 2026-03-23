import { app } from '@/firebase/config'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/** Firestore e Storage usam o mesmo `app` de `@/firebase/config` (evita dois `initializeApp`). */
export const db = getFirestore(app)
export const storage = getStorage(app)
