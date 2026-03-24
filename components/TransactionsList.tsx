import { useAccount } from '@/contexts/AccountContext'
import { formatCurrency } from '@/lib/format'
import type { Transaction, TransactionType } from '@/lib/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

const PAGE_SIZE = 20


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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const hasActiveFilters = selectedType !== 'todos' || dateFrom !== '' || dateTo !== '' || search !== ''

  const resetFilters = useCallback((fn: () => void) => {
    fn()
    setVisibleCount(PAGE_SIZE)
  }, [])

  const clearFilters = () => {
    setSelectedType('todos')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setShowDateFilters(false)
    setVisibleCount(PAGE_SIZE)
  }

  const allFiltered = useMemo(() => {
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
    return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [account, selectedType, search, dateFrom, dateTo])

  const displayedTransactions = useMemo(
    () => allFiltered.slice(0, visibleCount),
    [allFiltered, visibleCount],
  )

  const hasMore = visibleCount < allFiltered.length

  const handleLoadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE)
    }
  }, [hasMore])

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Excluir transação',
      'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ],
    )
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
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={14} color="#dc2626" />
          </Pressable>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={(v) => { setSearch(v); setVisibleCount(PAGE_SIZE) }}
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
            onPress={() => resetFilters(() => setSelectedType(item.value))}
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
                onChangeText={(t) => { setDateFrom(formatDateInput(t)); setVisibleCount(PAGE_SIZE) }}
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
                onChangeText={(t) => { setDateTo(formatDateInput(t)); setVisibleCount(PAGE_SIZE) }}
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
          {displayedTransactions.length} de {allFiltered.length}{' '}
          {allFiltered.length === 1 ? 'transação' : 'transações'}
        </Text>
        {hasActiveFilters && (
          <Pressable style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close-circle-outline" size={13} color="#ffd33d" />
            <Text style={styles.clearButtonText}>Limpar filtros</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={displayedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color="#555" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#aaa" />
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
})

