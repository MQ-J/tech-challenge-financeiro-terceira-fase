/**
 * Formata valor numérico como moeda BRL para exibição.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata string de data (YYYY-MM-DD) para dd/mm/yyyy.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Retorna o mês por extenso (pt-BR) a partir de uma string de data.
 */
export function formatMonth(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { month: 'long' })
}

/**
 * Formata valor digitado no input como "0,00" (centavos como últimos 2 dígitos).
 */
export function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''
  const amount = Number.parseInt(numbers, 10) / 100
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Converte string formatada "1.234,56" para número (1234.56).
 */
export function parseCurrency(value: string): number {
  const numbers = value.replace(/\D/g, '')
  return Number.parseInt(numbers, 10) / 100
}
