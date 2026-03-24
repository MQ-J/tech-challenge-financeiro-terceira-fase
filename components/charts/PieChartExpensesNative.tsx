import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'
import type { Transaction } from '@/lib/types'
import { buildPieChartData, transactionsChartRemountKey } from '@/lib/chartData'

interface Props {
  transactions: Transaction[]
}

export function PieChartExpensesNative({ transactions }: Props) {
  const chartRemountKey = useMemo(
    () => transactionsChartRemountKey(transactions),
    [transactions],
  )

  const now = new Date()
  const currentYear = now.getFullYear()
  const monthName = now.toLocaleString('default', { month: 'long' })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const data = buildPieChartData(transactions)
  const hasData = data.length > 0

  if (!hasData) {
    return (
      <View key={chartRemountKey} style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhuma despesa registrada no mês atual</Text>
        <Text style={styles.emptySubtitle}>Adicione despesas para visualizar o gráfico</Text>
      </View>
    )
  }

  const chartData = data.map((d) => ({
    value: d.value,
    color: d.color,
    text: d.name,
  }))

  return (
    <View key={chartRemountKey} style={styles.card}>
      <Text style={styles.title}>Despesas por categoria</Text>
      <Text style={styles.subtitle}>
        {capitalizedMonth} - {currentYear}
      </Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          radius={90}
          focusOnPress
        />
        <View style={styles.legend}>
          {data.map((slice) => (
            <View key={slice.name} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
              <Text style={styles.legendLabel}>{slice.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
    alignSelf: 'stretch',
  },
  emptyContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  legend: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 2,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: '#fff',
  },
})

