import { PrimaryButton } from '@/components/PrimaryButton'
import { useAccount } from '@/contexts/AccountContext'
import { auth } from '@/firebase/config'
import { formatCurrencyInput, parseCurrency } from '@/lib/format'
import { uploadReceipt } from '@/lib/receipt-storage'
import type { TransactionDocUpdate } from '@/lib/firestore'
import {
  TRANSACTION_TYPES,
  type TransactionFormValues,
  formDateToIso,
  isoToFormDate,
  transactionSchema,
} from '@/lib/transaction-schema'
import type { Transaction } from '@/lib/types'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { zodResolver } from '@hookform/resolvers/zod'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

interface TransactionFormProps {
  /** When provided the form operates in edit mode */
  transaction?: Transaction
  onSuccess?: () => void
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const { account, addTransaction, updateTransaction } = useAccount()
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  /** Pré-visualização: imagem ou PDF (galeria/câmera = imagem). */
  const [receiptAttachKind, setReceiptAttachKind] = useState<'image' | 'pdf'>('image')
  const [receiptPickedLabel, setReceiptPickedLabel] = useState<string | null>(null)
  const isEditMode = Boolean(transaction)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type ?? 'deposito',
      amount: transaction
        ? Math.abs(transaction.amount).toFixed(2).replace('.', ',')
        : '',
      description: transaction?.description ?? '',
      date: transaction
        ? isoToFormDate(transaction.date)
        : isoToFormDate(new Date().toISOString().split('T')[0]),
      receiptUri: transaction?.receiptUrl ?? '',
    },
  })

  useEffect(() => {
    if (transaction) {
      const url = transaction.receiptUrl ?? ''
      const isPdf =
        /\.pdf(\?|#|$)/i.test(url) ||
        url.toLowerCase().includes('application%2Fpdf')
      setReceiptAttachKind(isPdf ? 'pdf' : 'image')
      setReceiptPickedLabel(isPdf ? 'Recibo em PDF' : null)
      reset({
        type: transaction.type,
        amount: Math.abs(transaction.amount).toFixed(2).replace('.', ','),
        description: transaction.description ?? '',
        date: isoToFormDate(transaction.date),
        receiptUri: url,
      })
    } else {
      setReceiptAttachKind('image')
      setReceiptPickedLabel(null)
      reset({
        type: 'deposito',
        amount: '',
        description: '',
        date: isoToFormDate(new Date().toISOString().split('T')[0]),
        receiptUri: '',
      })
    }
  }, [transaction, reset])

  const receiptUri = watch('receiptUri')

  const handlePickReceipt = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para anexar recibos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled && result.assets.length > 0) {
      setReceiptAttachKind('image')
      setReceiptPickedLabel(null)
      setValue('receiptUri', result.assets[0].uri, { shouldValidate: true })
    }
  }, [setValue])

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar fotos do recibo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (!result.canceled && result.assets.length > 0) {
      setReceiptAttachKind('image')
      setReceiptPickedLabel(null)
      setValue('receiptUri', result.assets[0].uri, { shouldValidate: true })
    }
  }, [setValue])

  const handlePickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    })
    if (result.canceled || !result.assets?.length) return
    const file = result.assets[0]
    const isPdf =
      file.mimeType === 'application/pdf' ||
      file.name?.toLowerCase().endsWith('.pdf')
    setReceiptAttachKind(isPdf ? 'pdf' : 'image')
    setReceiptPickedLabel(file.name ?? (isPdf ? 'Documento PDF' : 'Imagem'))
    setValue('receiptUri', file.uri, { shouldValidate: true })
  }, [setValue])

  const onSubmit = async (values: TransactionFormValues) => {
    const isoDate = formDateToIso(values.date)
    const numAmount = parseCurrency(values.amount)
    const finalAmount = values.type === 'deposito' ? numAmount : -Math.abs(numAmount)

    if (!account) {
      Toast.show({
        type: 'error',
        text1: 'Sessão indisponível',
        text2: 'Faça login novamente para salvar a transação.',
      })
      return
    }

    const uid = account.uid ?? auth.currentUser?.uid
    if (!uid) {
      Toast.show({
        type: 'error',
        text1: 'Sessão inválida',
        text2: 'Não foi possível identificar o usuário para enviar o arquivo.',
      })
      return
    }

    const presetId = isEditMode && transaction ? transaction.id : Date.now().toString()
    let nextReceiptUrl: string | null | undefined = undefined

    if (values.receiptUri && !values.receiptUri.startsWith('https://')) {
      try {
        setUploading(true)
        nextReceiptUrl = await uploadReceipt(values.receiptUri, {
          uid,
          accountNumber: account.accountNumber,
          transactionId: presetId,
          fileNameHint: receiptPickedLabel,
        })
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Verifique conexão, login e regras do Storage.'
        Toast.show({
          type: 'error',
          text1: 'Falha no upload do recibo',
          text2: message,
        })
        return
      } finally {
        setUploading(false)
      }
    } else if (values.receiptUri) {
      nextReceiptUrl = values.receiptUri
    } else if (isEditMode && transaction?.receiptUrl) {
      /** Usuário removeu o recibo no formulário — limpa Firestore e Storage após salvar. */
      nextReceiptUrl = null
    }

    const basePayload = {
      type: values.type,
      amount: finalAmount,
      date: isoDate,
      description:
        (values.description?.trim() ||
          TRANSACTION_TYPES.find((t) => t.value === values.type)?.label) ??
        values.type,
    }

    if (isEditMode && transaction) {
      const patch: TransactionDocUpdate = {
        ...basePayload,
        ...(nextReceiptUrl !== undefined ? { receiptUrl: nextReceiptUrl } : {}),
      }
      updateTransaction(transaction.id, patch)
    } else {
      const newTransaction: Omit<Transaction, 'id'> = {
        ...basePayload,
        ...(typeof nextReceiptUrl === 'string' ? { receiptUrl: nextReceiptUrl } : {}),
      }
      addTransaction(newTransaction, presetId)
    }

    onSuccess?.()
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Type selector */}
      <Text style={styles.fieldLabel}>Tipo de transação</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { value, onChange } }) => (
          <>
            <Pressable
              style={styles.typeTrigger}
              onPress={() => setTypeModalVisible(true)}
            >
              <Text style={styles.typeTriggerText}>
                {TRANSACTION_TYPES.find((t) => t.value === value)?.label ?? value}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>
            <Modal
              visible={typeModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setTypeModalVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setTypeModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecione o tipo</Text>
                  {TRANSACTION_TYPES.map((t) => (
                    <Pressable
                      key={t.value}
                      style={[
                        styles.modalOption,
                        value === t.value && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        onChange(t.value)
                        setTypeModalVisible(false)
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          value === t.value && styles.modalOptionTextSelected,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </>
        )}
      />
      {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}

      {/* Amount */}
      <Text style={styles.fieldLabel}>Valor</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange } }) => (
          <View style={[styles.amountRow, errors.amount && styles.inputError]}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.amountInput}
              value={value}
              onChangeText={(text) => onChange(formatCurrencyInput(text))}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={16}
            />
          </View>
        )}
      />
      {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}

      {/* Description */}
      <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Descrição da transação"
            placeholderTextColor="#999"
            maxLength={120}
          />
        )}
      />
      {errors.description && (
        <Text style={styles.errorText}>{errors.description.message}</Text>
      )}

      {/* Date */}
      <Text style={styles.fieldLabel}>Data</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            value={value}
            onChangeText={(text) => {
              let formatted = text.replace(/\D/g, '')
              if (formatted.length > 2) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`
              if (formatted.length > 5) formatted = `${formatted.slice(0, 5)}/${formatted.slice(5)}`
              onChange(formatted.slice(0, 10))
            }}
            onBlur={onBlur}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
          />
        )}
      />
      {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}

      <Text style={styles.fieldLabel}>Recibo (opcional)</Text>
      <View style={styles.receiptRow}>
        <Pressable style={styles.receiptButton} onPress={handlePickReceipt}>
          <Ionicons name="image-outline" size={18} color="#333" />
          <Text style={styles.receiptButtonText}>Galeria</Text>
        </Pressable>
        <Pressable style={styles.receiptButton} onPress={handleTakePhoto}>
          <Ionicons name="camera-outline" size={18} color="#333" />
          <Text style={styles.receiptButtonText}>Câmera</Text>
        </Pressable>
        <Pressable style={styles.receiptButton} onPress={handlePickDocument}>
          <Ionicons name="document-attach-outline" size={18} color="#333" />
          <Text style={styles.receiptButtonText}>Arquivo</Text>
        </Pressable>
        {receiptUri ? (
          <Pressable
            style={styles.receiptButton}
            onPress={() => {
              setReceiptAttachKind('image')
              setReceiptPickedLabel(null)
              setValue('receiptUri', '')
            }}
          >
            <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
            <Text style={[styles.receiptButtonText, { color: '#dc2626' }]}>Remover</Text>
          </Pressable>
        ) : null}
      </View>

      {receiptUri ? (
        receiptAttachKind === 'pdf' ? (
          <View style={styles.receiptFilePreview}>
            <Ionicons name="document-text-outline" size={44} color="#555" />
            <Text style={styles.receiptFilePreviewText} numberOfLines={2}>
              {receiptPickedLabel ?? 'Documento PDF'}
            </Text>
          </View>
        ) : (
          <Image source={{ uri: receiptUri }} style={styles.receiptPreview} resizeMode="cover" />
        )
      ) : null}

      {uploading && (
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.uploadingText}>Enviando recibo...</Text>
        </View>
      )}

      <PrimaryButton
        label={isEditMode ? 'Salvar alterações' : 'Concluir transação'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting || uploading}
        style={styles.submitButton}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  typeTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  typeTriggerText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: theme.primary,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: theme.primaryForeground,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingLeft: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingRight: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  receiptButtonText: {
    fontSize: 14,
    color: '#333',
  },
  receiptPreview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 4,
  },
  receiptFilePreview: {
    width: '100%',
    minHeight: 120,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  receiptFilePreviewText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  uploadingText: {
    fontSize: 14,
    color: '#666',
  },
  scroll: {
    flex: 1,
  },
  container: {
    gap: 6,
    paddingBottom: 32,
  },
  submitButton: {
    marginTop: 16,
  },
})
