import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import type { Transaction } from '@/lib/types'
import { buildBarChartData, transactionsChartRemountKey } from '@/lib/chartData'
import { formatCurrency } from '@/lib/format'

interface Props {
  transactions: Transaction[]
}

export function BarChartTransactionsNative({ transactions }: Props) {
  const chartRemountKey = useMemo(
    () => transactionsChartRemountKey(transactions),
    [transactions],
  )

  const data = buildBarChartData(transactions)
  const hasData = data.some((d) => d.receitas > 0 || d.despesas > 0)

  if (!hasData) {
    return (
      <View key={chartRemountKey} style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhuma transação registrada nos últimos 6 meses</Text>
        <Text style={styles.emptySubtitle}>Adicione transações para visualizar o gráfico</Text>
      </View>
    )
  }

  const chartData = data.map((d) => ({
    label: (() => {
      const [mm, yyyy] = d.label.split('/')
      return `${mm}/${yyyy.slice(-2)}`
    })(),
    stacks: [
      { value: d.receitas, color: '#16a34a' },
      { value: d.despesas, color: '#ef4444' },
    ],
  }))

  return (
    <View key={chartRemountKey} style={styles.card}>
      <Text style={styles.title}>Balanço mensal</Text>
      <Text style={styles.subtitle}>Últimos 6 meses</Text>
      <View style={styles.chartContainer}>
        <BarChart
          stackData={chartData}
          width={320}
          height={220}
          barWidth={18}
          noOfSections={4}
          spacing={18}
          isAnimated
          yAxisTextStyle={{ color: '#fff', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#fff', fontSize: 10 }}
          yAxisLabelWidth={72}
          formatYLabel={(val) => formatCurrency(Number(val)).replace('R$', 'R$ ')}
          hideRules={false}
          rulesColor="rgba(255,255,255,0.1)"
          xAxisColor="rgba(255,255,255,0.2)"
          yAxisColor="rgba(255,255,255,0.2)"
          barBorderRadius={4}
          hideOrigin
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
            <Text style={styles.legendLabel}>Receitas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendLabel}>Despesas</Text>
          </View>
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
  legendRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: '#fff',
  },
})
