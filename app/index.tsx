import { Redirect } from 'expo-router'
import { useAccount } from '@/contexts/AccountContext'
import { ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  const { account, isHydrated } = useAccount()

  if (!isHydrated) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#25292e',
        }}
        edges={['top', 'bottom']}
      >
        <ActivityIndicator size="large" color="#ffd33d" />
      </SafeAreaView>
    )
  }

  if (!account) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)/" />
}

