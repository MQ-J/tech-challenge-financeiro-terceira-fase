import { storage } from '@/lib/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

/**
 * Uploads a receipt image to Firebase Storage and returns its public download URL.
 * Path: receipts/{accountNumber}/{transactionId}/{filename}
 */
export async function uploadReceipt(
  localUri: string,
  accountNumber: string,
  transactionId: string,
): Promise<string> {
  const filename = `receipt_${Date.now()}.jpg`
  const storageRef = ref(storage, `receipts/${accountNumber}/${transactionId}/${filename}`)

  const response = await fetch(localUri)
  const blob = await response.blob()

  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  })

  return getDownloadURL(snapshot.ref)
}
