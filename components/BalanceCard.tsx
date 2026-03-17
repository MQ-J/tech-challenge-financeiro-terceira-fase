import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { theme } from '@/theme/colors'
import { formatCurrency } from '@/lib/format'

interface BalanceCardProps {
  balance: number
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Saldo</Text>
        <Pressable
          onPress={() => setShowBalance(!showBalance)}
          style={styles.eyeButton}
          accessibilityLabel={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
        >
          <Ionicons
            name={showBalance ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color={theme.primaryForeground}
          />
        </Pressable>
      </View>
      <Text style={styles.subLabel}>Conta Corrente</Text>
      <Text style={styles.balance}>
        {showBalance ? formatCurrency(balance) : '••••••'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: theme.primaryForeground,
    opacity: 0.9,
  },
  eyeButton: {
    padding: 4,
  },
  subLabel: {
    fontSize: 12,
    color: theme.primaryForeground,
    opacity: 0.75,
    marginBottom: 4,
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.primaryForeground,
    letterSpacing: -0.5,
  },
})
