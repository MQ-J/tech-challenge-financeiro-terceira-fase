import React from 'react'
import type { Transaction } from '@/lib/types'
import { BarChartTransactionsNative } from './BarChartTransactionsNative'
import { PieChartExpensesNative } from './PieChartExpensesNative'

type ChartType = 'Bar' | 'Pie'

interface Props {
  type: ChartType
  transactions: Transaction[]
}

export function ChartsNative({ type, transactions }: Props) {
  if (type === 'Bar') {
    return <BarChartTransactionsNative transactions={transactions} />
  }

  if (type === 'Pie') {
    return <PieChartExpensesNative transactions={transactions} />
  }

  return null
}

