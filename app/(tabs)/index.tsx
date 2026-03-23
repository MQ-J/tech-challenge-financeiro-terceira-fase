import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions, Animated } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAccount } from '@/contexts/AccountContext'
import { PrimaryButton } from '@/components/PrimaryButton'
import { BalanceCard } from '@/components/BalanceCard'
import { TransactionForm } from '@/components/TransactionForm'
import { RecentTransactions } from '@/components/RecentTransactions'
import { useRouter } from 'expo-router'
import { MAX_CONTENT_WIDTH, isTabletLayout } from '@/constants/layout'
import { ChartsNative } from '@/components/charts/ChartsNative'
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
  const { account, logout, isHydrated } = useAccount()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const contentWidth = Math.min(width - 32, MAX_CONTENT_WIDTH)
  const centered = width > MAX_CONTENT_WIDTH
  const isTablet = isTabletLayout(width)
  const isFocused = useIsFocused()

  const headerOpacity = useRef(new Animated.Value(0)).current
  const headerTranslateY = useRef(new Animated.Value(16)).current
  const balanceOpacity = useRef(new Animated.Value(0)).current
  const balanceTranslateY = useRef(new Animated.Value(16)).current
  const transactionsOpacity = useRef(new Animated.Value(0)).current
  const transactionsTranslateY = useRef(new Animated.Value(16)).current
  const chartsOpacity = useRef(new Animated.Value(0)).current
  const chartsTranslateY = useRef(new Animated.Value(16)).current
  const homeEnterAnimation = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (!isHydrated || !account || !isFocused) {
      homeEnterAnimation.current?.stop()
      return
    }

    homeEnterAnimation.current?.stop()

    headerOpacity.setValue(0)
    headerTranslateY.setValue(16)
    balanceOpacity.setValue(0)
    balanceTranslateY.setValue(16)
    transactionsOpacity.setValue(0)
    transactionsTranslateY.setValue(16)
    chartsOpacity.setValue(0)
    chartsTranslateY.setValue(16)

    const anim = Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(balanceOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(balanceTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(transactionsOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(transactionsTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(chartsOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(chartsTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
    ])
    homeEnterAnimation.current = anim
    anim.start()

    return () => {
      anim.stop()
    }
  }, [
    account,
    isHydrated,
    isFocused,
    headerOpacity,
    headerTranslateY,
    balanceOpacity,
    balanceTranslateY,
    transactionsOpacity,
    transactionsTranslateY,
    chartsOpacity,
    chartsTranslateY,
  ])

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </SafeAreaView>
    )
  }

  if (!account) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
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
      </SafeAreaView>
    )
  }

  const firstName = account.userName.split(' ')[0] ?? ''

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          centered && { alignItems: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.content, { width: contentWidth }]}>
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
          ]}
        >
          <Text style={styles.greeting}>Olá, {firstName}!</Text>
          <Text style={styles.date}>{getGreeting()}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            { opacity: balanceOpacity, transform: [{ translateY: balanceTranslateY }] },
          ]}
        >
          <BalanceCard balance={account.balance} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: transactionsOpacity, transform: [{ translateY: transactionsTranslateY }] },
          ]}
        >
          <Text style={styles.cardTitle}>Nova transação</Text>
          <TransactionForm />
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            { opacity: transactionsOpacity, transform: [{ translateY: transactionsTranslateY }] },
          ]}
        >
          <RecentTransactions />
        </Animated.View>

        <Animated.View
          style={{
            opacity: chartsOpacity,
            transform: [{ translateY: chartsTranslateY }],
          }}
        >
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
        </Animated.View>

        <PrimaryButton
          label="Sair"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          iconName="log-out-outline"
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: '#25292e',
  },
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
