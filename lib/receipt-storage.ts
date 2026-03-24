import { storage } from '@/lib/firebase'
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage'

export type UploadReceiptParams = {
  /** Firebase Auth UID — deve bater com `receipts/{uid}/...` nas Storage Rules. */
  uid: string
  accountNumber: string
  transactionId: string
  /** Nome original (ex.: do DocumentPicker) para inferir extensão em URIs sem sufixo. */
  fileNameHint?: string | null
}

function extensionFromUri(uri: string, fileNameHint?: string | null): string {
  const paths = [fileNameHint, uri.split('?')[0]].filter(Boolean) as string[]
  for (const p of paths) {
    const lower = p.toLowerCase()
    if (lower.endsWith('.png')) return 'png'
    if (lower.endsWith('.webp')) return 'webp'
    if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'heic'
    if (lower.endsWith('.pdf')) return 'pdf'
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg'
  }
  return 'jpg'
}

function contentTypeForExt(ext: string, blobType: string): string {
  if (blobType && blobType !== 'application/octet-stream') {
    return blobType
  }
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'pdf':
      return 'application/pdf'
    case 'heic':
    case 'heif':
      return 'image/heic'
    default:
      return 'image/jpeg'
  }
}

/**
 * Envia recibo/documento ao Firebase Storage e retorna a URL de download (tokenizada).
 * Path: `receipts/{uid}/{accountNumber}/{transactionId}/{filename}`
 */
export async function uploadReceipt(
  localUri: string,
  params: UploadReceiptParams,
): Promise<string> {
  const { uid, accountNumber, transactionId, fileNameHint } = params
  const ext = extensionFromUri(localUri, fileNameHint)
  const filename = `receipt_${Date.now()}.${ext}`
  const storageRef = ref(
    storage,
    `receipts/${uid}/${accountNumber}/${transactionId}/${filename}`,
  )

  const response = await fetch(localUri)
  if (!response.ok) {
    throw new Error(`Não foi possível ler o arquivo local (${response.status})`)
  }
  const blob = await response.blob()
  const contentType = contentTypeForExt(ext, blob.type)

  const snapshot = await uploadBytes(storageRef, blob, {
    contentType,
  })

  return getDownloadURL(snapshot.ref)
}

/** Padrão de URL de download do bucket default (inclui token em query). */
const FIREBASE_STORAGE_DOWNLOAD_RE =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/

/**
 * Extrai o caminho do objeto a partir da URL pública do Firebase Storage.
 */
export function storageObjectPathFromDownloadUrl(url: string): string | null {
  const m = url.match(FIREBASE_STORAGE_DOWNLOAD_RE)
  if (!m) return null
  try {
    return decodeURIComponent(m[2].replace(/\+/g, ' '))
  } catch {
    return null
  }
}

function isFirebaseStorageReceiptUrl(url: string): boolean {
  if (!url.includes('firebasestorage.googleapis.com')) return false
  const path = storageObjectPathFromDownloadUrl(url)
  return path != null && path.startsWith('receipts/')
}

/**
 * Remove o arquivo no Storage a partir da URL de download.
 * Ignora URLs que não são do Firebase ou fora de `receipts/`.
 * Falhas tipo "object-not-found" são ignoradas.
 */
export async function deleteReceiptFromFirebaseIfPresent(
  downloadUrl: string | undefined | null,
): Promise<void> {
  if (!downloadUrl) return
  if (!isFirebaseStorageReceiptUrl(downloadUrl)) return
  const path = storageObjectPathFromDownloadUrl(downloadUrl)
  if (!path) return

  try {
    await deleteObject(ref(storage, path))
  } catch (e: unknown) {
    const code =
      typeof e === 'object' && e !== null && 'code' in e
        ? String((e as { code: string }).code)
        : ''
    if (code === 'storage/object-not-found') return
    console.warn('[receipt-storage] deleteReceiptFromFirebaseIfPresent', e)
  }
}
