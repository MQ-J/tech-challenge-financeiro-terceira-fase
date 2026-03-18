import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'
import type { Transaction } from '@/lib/types'
import { formatCurrency, formatDate, formatMonth } from '@/lib/format'

const TYPE_LABELS: Record<Transaction['type'], string> = {
  deposito: 'Depósito',
  transferencia: 'Transferência',
  pagamento: 'Pagamento',
  saque: 'Saque',
}

interface RecentTransactionRowProps {
  transaction: Transaction
}

export function RecentTransactionRow({ transaction }: RecentTransactionRowProps) {
  const label = TYPE_LABELS[transaction.type] ?? transaction.description ?? transaction.type
  const isPositive = transaction.amount >= 0
  const displayValue = formatCurrency(Math.abs(transaction.amount))
  const valuePrefix = transaction.amount >= 0 ? '' : '-'

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(8)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY])

  return (
    <Animated.View style={[styles.row, { opacity, transform: [{ translateY }] }]}>
      <Animated.View style={styles.left}>
        <Text style={styles.month}>{formatMonth(transaction.date)}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.amount, isPositive ? styles.amountPositive : styles.amountNegative]}>
          {valuePrefix}{displayValue}
        </Text>
      </Animated.View>
      <Text style={styles.date}>{formatDate(transaction.date)}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  left: {
    flex: 1,
  },
  month: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22c55e',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  amountPositive: {
    color: '#22c55e',
  },
  amountNegative: {
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
})
