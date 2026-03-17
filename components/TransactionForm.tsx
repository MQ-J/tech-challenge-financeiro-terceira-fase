import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAccount } from '@/contexts/AccountContext'
import { PrimaryButton } from '@/components/PrimaryButton'
import { theme } from '@/theme/colors'
import type { TransactionType } from '@/lib/types'
import { formatCurrencyInput, parseCurrency } from '@/lib/format'

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'deposito', label: 'Depósito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'saque', label: 'Saque' },
]

export function TransactionForm() {
  const { addTransaction } = useAccount()
  const [type, setType] = useState<TransactionType>('deposito')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [typeModalVisible, setTypeModalVisible] = useState(false)

  const handleAmountChange = (text: string) => {
    setAmount(formatCurrencyInput(text))
  }

  const handleSubmit = () => {
    const numAmount = parseCurrency(amount)
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      return
    }
    const finalAmount = type === 'deposito' ? numAmount : -Math.abs(numAmount)
    addTransaction({
      type,
      amount: finalAmount,
      date: new Date().toISOString().split('T')[0],
      description:
        description.trim() ||
        TRANSACTION_TYPES.find((t) => t.value === type)?.label ||
        type,
    })
    setAmount('')
    setDescription('')
  }

  const currentTypeLabel = TRANSACTION_TYPES.find((t) => t.value === type)?.label ?? type
  const numAmount = parseCurrency(amount)
  const isValid = !Number.isNaN(numAmount) && numAmount > 0

  return (
    <View style={styles.container}>
      <Text style={styles.fieldLabel}>Tipo de transação</Text>
      <Pressable
        style={styles.typeTrigger}
        onPress={() => setTypeModalVisible(true)}
      >
        <Text style={styles.typeTriggerText}>{currentTypeLabel}</Text>
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
                  type === t.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setType(t.value)
                  setTypeModalVisible(false)
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    type === t.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Text style={styles.fieldLabel}>Valor</Text>
      <View style={styles.amountRow}>
        <Text style={styles.currencyPrefix}>R$</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={handleAmountChange}
          placeholder="0,00"
          placeholderTextColor="#999"
          keyboardType="numeric"
          maxLength={16}
        />
      </View>

      <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição da transação"
        placeholderTextColor="#999"
      />

      <PrimaryButton
        label="Concluir transação"
        onPress={handleSubmit}
        disabled={!isValid}
        style={styles.submitButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
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
  submitButton: {
    marginTop: 8,
  },
})
