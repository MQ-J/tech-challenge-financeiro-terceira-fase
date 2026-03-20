import { parseCurrency } from '@/lib/format'
import { z } from 'zod'

export const TRANSACTION_TYPES = [
  { value: 'deposito', label: 'Depósito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'pagamento', label: 'Pagamento' },
  { value: 'saque', label: 'Saque' },
] as const

export type TransactionTypeValue = (typeof TRANSACTION_TYPES)[number]['value']

function parseBrDate(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const date = new Date(`${yyyy}-${mm}-${dd}`)
  if (isNaN(date.getTime())) return null
  return `${yyyy}-${mm}-${dd}`
}

export const transactionSchema = z.object({
  type: z.enum(['deposito', 'transferencia', 'pagamento', 'saque'], {
    required_error: 'Selecione o tipo de transação',
  }),

  amount: z
    .string({ required_error: 'Informe o valor' })
    .min(1, 'Informe o valor')
    .refine(
      (v) => {
        const n = parseCurrency(v)
        return !isNaN(n) && n > 0
      },
      { message: 'Informe um valor maior que zero' },
    ),

  description: z
    .string()
    .max(120, 'Descrição deve ter no máximo 120 caracteres')
    .optional(),

  date: z
    .string({ required_error: 'Informe a data' })
    .min(1, 'Informe a data')
    .refine((v) => parseBrDate(v) !== null, {
      message: 'Data inválida. Use o formato DD/MM/AAAA',
    }),

  receiptUri: z.string().optional(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export function formDateToIso(dateBr: string): string {
  return parseBrDate(dateBr) ?? dateBr
}

export function isoToFormDate(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return isoDate
  return `${match[3]}/${match[2]}/${match[1]}`
}
