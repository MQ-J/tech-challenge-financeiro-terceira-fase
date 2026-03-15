import { View, Text, StyleSheet } from 'react-native'
import { useAccount } from '@/contexts/AccountContext'
import { PrimaryButton } from '@/components/PrimaryButton'
import { useRouter } from 'expo-router'

export default function Index() {
  const { account, logout } = useAccount()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Você logou, parabéns! Está na home do canal
      </Text>
      {account ? (
        <Text style={styles.subtitle}>
          Olá, {account.userName.split(' ')[0]}!
        </Text>
      ) : null}
      <PrimaryButton
        label="Sair"
        variant="outline"
        onPress={handleLogout}
        style={{ marginTop: 24 }}
        iconName="log-out-outline"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffd33d',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#fff',
  },
})
