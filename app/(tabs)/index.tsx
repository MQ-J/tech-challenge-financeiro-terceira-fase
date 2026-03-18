import { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useAccount } from '@/contexts/AccountContext'
import { PrimaryButton } from '@/components/PrimaryButton'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionForm } from '@/components/TransactionForm'
import { RecentTransactions } from '@/components/RecentTransactions'
import { useRouter } from 'expo-router'
import { MAX_CONTENT_WIDTH, isTabletLayout } from '@/constants/layout'
import { ChartsNative } from '@/components/charts/ChartsNative'
import { getSecureItem } from '@/lib/storage'
import type { Account } from '@/lib/types'

function getGreeting(): string {
  const date = new Date()
  const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const capitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
  return `${capitalized}, ${formattedDate}`
}

export default function HomeScreen() {
  const { account, logout, isHydrated, login } = useAccount()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const isTablet = isTabletLayout(width)

  console.log('[HomeScreen] isHydrated=', isHydrated, 'account=', account?.email)

  useEffect(() => {
    if (!isHydrated || account) return
    const rehydrate = async () => {
      const storedAccount = await getSecureItem<Account>('currentAccount')
      if (storedAccount) {
        await login(storedAccount)
      }
    }
    void rehydrate()
  }, [account, isHydrated, login])

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    )
  }

  if (!account) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyTitle}>Nenhuma conta carregada</Text>
        <Text style={styles.emptySubtitle}>
          Volte para a tela de login para acessar sua conta.
        </Text>
        <PrimaryButton
          label="Ir para o login"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.emptyButton}
          iconName="log-in-outline"
        />
      </View>
    )
  }

  const firstName = account.userName.split(' ')[0] ?? ''

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        centered && { alignItems: 'center' },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {firstName}!</Text>
          <Text style={styles.date}>{getGreeting()}</Text>
        </View>

        <View style={styles.section}>
          <BalanceCard balance={account.balance} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nova transação</Text>
          <TransactionForm />
        </View>

        <View style={styles.section}>
          <RecentTransactions />
        </View>

        {isTablet ? (
          <View style={[styles.chartsRow, styles.chartsRowTablet]}>
            <View style={[styles.chartItem, styles.chartItemTablet]}>
              <ChartsNative type="Bar" transactions={account.transactions} />
            </View>
            <View style={[styles.chartItem, styles.chartItemTablet]}>
              <ChartsNative type="Pie" transactions={account.transactions} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.chartItem}>
              <ChartsNative type="Bar" transactions={account.transactions} />
            </View>
            <View style={styles.chartItem}>
              <ChartsNative type="Pie" transactions={account.transactions} />
            </View>
          </>
        )}

        <PrimaryButton
          label="Sair"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          iconName="log-out-outline"
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25292e',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 4,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  content: {
    maxWidth: MAX_CONTENT_WIDTH,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  chartsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartsRowTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartItemTablet: {
    flex: 1,
    marginBottom: 0,
    marginRight: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
})
