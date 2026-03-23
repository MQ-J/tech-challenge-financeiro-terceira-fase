import { useAccount } from '@/contexts/AccountContext'
import { formatCurrency } from '@/lib/format'
import type { Transaction, TransactionType } from '@/lib/types'
import { theme } from '@/theme/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'


const TYPE_CHIPS: { value: TransactionType | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'saque', label: 'Saque' },
]

const TYPE_LABELS: Record<TransactionType, string> = {
  deposito: 'Depósito',
  transferencia: 'Transferência',
  pagamento: 'Pagamento',
  saque: 'Saque',
}

interface TransactionsListProps {
  onEdit: (transaction: Transaction) => void
}

export default function TransactionsList({ onEdit }: TransactionsListProps) {
  const { account, deleteTransaction } = useAccount()

  const [selectedType, setSelectedType] = useState<TransactionType | 'todos'>('todos')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [showDateFilters, setShowDateFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const deleteModalClearWebTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (deleteModalClearWebTimerRef.current) {
        clearTimeout(deleteModalClearWebTimerRef.current)
      }
    }
  }, [])

  const hasActiveFilters = selectedType !== 'todos' || dateFrom !== '' || dateTo !== '' || search !== ''

  const clearFilters = () => {
    setSelectedType('todos')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setShowDateFilters(false)
  }

  const localFiltered = useMemo(() => {
    if (!account) return []
    let list = account.transactions
    if (selectedType !== 'todos') {
      list = list.filter((t) => t.type === selectedType)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) =>
        (t.description ?? TYPE_LABELS[t.type]).toLowerCase().includes(q),
      )
    }
    if (dateFrom) {
      const parts = dateFrom.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (parts) {
        const iso = `${parts[3]}-${parts[2]}-${parts[1]}`
        list = list.filter((t) => t.date >= iso)
      }
    }
    if (dateTo) {
      const parts = dateTo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
      if (parts) {
        const iso = `${parts[3]}-${parts[2]}-${parts[1]}`
        list = list.filter((t) => t.date <= iso)
      }
    }
    return list
  }, [account, selectedType, search, dateFrom, dateTo])

  const displayedTransactions = useMemo(() => {
    return [...localFiltered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [localFiltered])

  /** Só esconde o modal; mantém `deleteTarget` até o fim da animação (evita sumir o resumo antes do overlay). */
  const closeDeleteModal = () => {
    setDeleteModalVisible(false)
    // react-native-web nem sempre chama onDismiss; limpa o alvo após o fade (~300ms).
    if (Platform.OS === 'web') {
      if (deleteModalClearWebTimerRef.current) {
        clearTimeout(deleteModalClearWebTimerRef.current)
      }
      deleteModalClearWebTimerRef.current = setTimeout(() => {
        deleteModalClearWebTimerRef.current = null
        setDeleteTarget(null)
      }, 320)
    }
  }

  const clearDeleteTargetAfterDismiss = () => {
    if (Platform.OS !== 'web') {
      setDeleteTarget(null)
    }
  }

  const handleDeletePress = (transaction: Transaction) => {
    if (Platform.OS === 'web' && deleteModalClearWebTimerRef.current) {
      clearTimeout(deleteModalClearWebTimerRef.current)
      deleteModalClearWebTimerRef.current = null
    }
    setDeleteTarget(transaction)
    setDeleteModalVisible(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTransaction(deleteTarget.id)
    }
    closeDeleteModal()
  }

  const formatDateInput = (text: string) => {
    let formatted = text.replace(/\D/g, '')
    if (formatted.length > 2) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`
    if (formatted.length > 5) formatted = `${formatted.slice(0, 5)}/${formatted.slice(5)}`
    return formatted.slice(0, 10)
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{TYPE_LABELS[item.type]}</Text>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {item.description ?? TYPE_LABELS[item.type]}
        </Text>
        <Text style={styles.date}>
          {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.amount,
            item.amount >= 0 ? styles.income : styles.expense,
          ]}
        >
          {item.amount >= 0 ? '+' : ''}
          {formatCurrency(item.amount)}
        </Text>
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(item)}
          >
            <Ionicons name="pencil-outline" size={14} color="#1d4ed8" />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeletePress(item)}
          >
            <Ionicons name="trash-outline" size={14} color="#dc2626" />
          </Pressable>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
        onDismiss={clearDeleteTargetAfterDismiss}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Excluir transação</Text>
            <Text style={styles.deleteModalMessage}>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser
              desfeita.
            </Text>
            {deleteTarget ? (
              <View style={styles.deleteModalSummary}>
                <Text style={styles.deleteModalSummaryLabel}>
                  {TYPE_LABELS[deleteTarget.type]}
                  {deleteTarget.description
                    ? ` · ${deleteTarget.description}`
                    : ''}
                </Text>
                <Text
                  style={[
                    styles.deleteModalSummaryAmount,
                    deleteTarget.amount >= 0
                      ? styles.deleteModalAmountPositive
                      : styles.deleteModalAmountNegative,
                  ]}
                >
                  {deleteTarget.amount >= 0 ? '+' : ''}
                  {formatCurrency(deleteTarget.amount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.deleteModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteCancelButton,
                  pressed && styles.deleteCancelButtonPressed,
                ]}
                onPress={closeDeleteModal}
              >
                <Text style={styles.deleteCancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteConfirmButton,
                  pressed && styles.deleteConfirmButtonPressed,
                ]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por descrição..."
          placeholderTextColor="#555"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#666" />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TYPE_CHIPS}
        keyExtractor={(t) => t.value}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.chip, selectedType === item.value && styles.chipSelected]}
            onPress={() => setSelectedType(item.value)}
          >
            <Text
              style={[styles.chipText, selectedType === item.value && styles.chipTextSelected]}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.dateToggle}
        onPress={() => setShowDateFilters((v) => !v)}
      >
        <Ionicons
          name={showDateFilters ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#aaa"
        />
        <Text style={styles.dateToggleText}>
          {showDateFilters ? 'Ocultar filtro de data' : 'Filtrar por data'}
        </Text>
      </Pressable>

      {showDateFilters && (
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>De</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                value={dateFrom}
                onChangeText={(t) => setDateFrom(formatDateInput(t))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={10}
              />
              {dateFrom.length > 0 && (
                <Pressable onPress={() => setDateFrom('')} style={styles.dateClear}>
                  <Ionicons name="close-circle" size={14} color="#666" />
                </Pressable>
              )}
            </View>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.dateLabel}>Até</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                style={styles.dateInput}
                value={dateTo}
                onChangeText={(t) => setDateTo(formatDateInput(t))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={10}
              />
              {dateTo.length > 0 && (
                <Pressable onPress={() => setDateTo('')} style={styles.dateClear}>
                  <Ionicons name="close-circle" size={14} color="#666" />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.resultRow}>
        <Text style={styles.resultCount}>
          {displayedTransactions.length}{' '}
          {displayedTransactions.length === 1 ? 'transação' : 'transações'}
        </Text>
        {hasActiveFilters && (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close-circle-outline" size={13} color="#ffd33d" />
            <Text style={styles.clearButtonText}>Limpar filtros</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        data={displayedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color="#555" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        }
        ListFooterComponent={null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    backgroundColor: '#1a1e23',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#eee',
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#ffd33d',
    borderColor: '#ffd33d',
  },
  chipText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#25292e',
    fontWeight: '600',
  },
  dateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateToggleText: {
    fontSize: 13,
    color: '#aaa',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#eee',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    backgroundColor: '#1a1e23',
    paddingRight: 6,
  },
  dateClear: {
    padding: 4,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  resultCount: {
    fontSize: 12,
    color: '#666',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#ffd33d',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1e2329',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLeft: {
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2d333b',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    color: '#ddd',
    fontWeight: '500',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontWeight: '700',
    fontSize: 15,
  },
  income: {
    color: '#16a34a',
  },
  expense: {
    color: '#ef4444',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#1d4ed8',
    backgroundColor: 'rgba(29,78,216,0.1)',
  },
  deleteButton: {
    borderColor: '#dc2626',
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#555',
    fontSize: 15,
  },
  footer: {
    marginVertical: 16,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  deleteModalMessage: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  deleteModalSummary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 4,
  },
  deleteModalSummaryLabel: {
    fontSize: 13,
    color: '#374151',
  },
  deleteModalSummaryAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteModalAmountPositive: {
    color: '#16a34a',
  },
  deleteModalAmountNegative: {
    color: '#dc2626',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  deleteCancelButton: {
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButtonPressed: {
    opacity: 0.85,
  },
  deleteCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  deleteConfirmButton: {
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  deleteConfirmButtonPressed: {
    opacity: 0.85,
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
})

