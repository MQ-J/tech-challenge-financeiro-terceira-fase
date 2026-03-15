import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import CryptoJS from 'crypto-js'

const getEncryptionKey = (): string => {
  return 'default-dev-key'
}

function isEncrypted(str: string): boolean {
  try {
    return str.startsWith('U2FsdGVkX1')
  } catch {
    return false
  }
}

export function encryptStorage(data: unknown): string {
  const jsonString = JSON.stringify(data)
  const encrypted = CryptoJS.AES.encrypt(jsonString, getEncryptionKey()).toString()
  return encrypted
}

export function decryptStorage(encrypted: string): unknown {
  try {
    if (!isEncrypted(encrypted)) {
      return JSON.parse(encrypted)
    }

    const decrypted = CryptoJS.AES.decrypt(encrypted, getEncryptionKey())
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedString) {
      throw new Error('Falha ao descriptografar')
    }

    return JSON.parse(decryptedString)
  } catch {
    try {
      return JSON.parse(encrypted)
    } catch {
      throw new Error('Não foi possível descriptografar ou fazer parse dos dados')
    }
  }
}

const isWeb = Platform.OS === 'web'

async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
    return
  }
  await SecureStore.setItemAsync(key, value)
}

async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  }
  return SecureStore.getItemAsync(key)
}

async function removeItemAsync(key: string): Promise<void> {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export async function setSecureItem(key: string, value: unknown): Promise<void> {
  try {
    const encrypted = encryptStorage(value)
    await setItemAsync(key, encrypted)
  } catch {
    await setItemAsync(key, JSON.stringify(value))
  }
}

export async function getSecureItem<T = unknown>(key: string): Promise<T | null> {
  try {
    const item = await getItemAsync(key)
    if (!item) return null

    const decrypted = decryptStorage(item)

    if (!isEncrypted(item)) {
      await setSecureItem(key, decrypted)
    }

    return decrypted as T
  } catch {
    const item = await getItemAsync(key)
    if (!item) return null
    try {
      return JSON.parse(item) as T
    } catch {
      return null
    }
  }
}

export async function removeSecureItem(key: string): Promise<void> {
  await removeItemAsync(key)
}

