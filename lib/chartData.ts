import type { Transaction } from './types'

export interface BarChartPoint {
  label: string
  receitas: number
  despesas: number
}

export interface PieChartSlice {
  name: string
  value: number
  color: string
}

export function buildBarChartData(transactions: Transaction[]): BarChartPoint[] {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    months.push(`${month}/${year}`)
  }

  const totals = months.reduce<Record<string, { receitas: number; despesas: number }>>(
    (acc, key) => {
      acc[key] = { receitas: 0, despesas: 0 }
      return acc
    },
    {},
  )

  transactions.forEach((t) => {
    const date = new Date(t.date)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const key = `${month}/${year}`

    if (!Object.prototype.hasOwnProperty.call(totals, key)) return

    if (t.amount > 0) totals[key].receitas += t.amount
    else if (t.amount < 0) totals[key].despesas += -t.amount
  })

  return months.map((label) => ({
    label,
    receitas: totals[label].receitas,
    despesas: totals[label].despesas,
  }))
}

export function buildPieChartData(transactions: Transaction[]): PieChartSlice[] {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const totals = transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.type === 'deposito') return acc
    if (t.amount >= 0) return acc

    const d = new Date(t.date)
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return acc

    acc[t.type] = (acc[t.type] ?? 0) + Math.abs(t.amount)
    return acc
  }, {})

  const colorByType: Record<string, string> = {
    pagamento: '#852B83',
    transferencia: '#00755C',
    saque: '#26979F',
  }

  return Object.entries(totals).map(([type, value]) => ({
    name: type,
    value,
    color: colorByType[type] || '#6366f1',
  }))
}

