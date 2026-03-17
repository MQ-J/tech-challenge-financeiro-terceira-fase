import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAccount } from '@/contexts/AccountContext'
import { RecentTransactionRow } from '@/components/RecentTransactionRow'
import { theme } from '@/theme/colors'

export function RecentTransactions() {
  const { account } = useAccount()
  const router = useRouter()
  const transactions = account?.transactions ?? []
  const recentTransactions = transactions.slice(0, 5)

  const handleVerTodas = () => {
    router.push('/(tabs)/transacoes')
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>
        <Pressable onPress={handleVerTodas} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>
      <View style={styles.content}>
        {recentTransactions.length > 0 ? (
          <>
            {recentTransactions.map((transaction) => (
              <RecentTransactionRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
            <Pressable onPress={handleVerTodas} style={styles.verTodas}>
              <Text style={styles.verTodasText}>Ver todas as transações</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </Pressable>
          </>
        ) : (
          <Text style={styles.empty}>Nenhuma transação encontrada</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    marginTop: 0,
  },
  verTodas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  verTodasText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  empty: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 24,
  },
})
