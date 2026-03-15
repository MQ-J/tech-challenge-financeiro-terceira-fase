import { Redirect } from 'expo-router'
import { useAccount } from '@/contexts/AccountContext'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const { account, isHydrated } = useAccount()

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#25292e',
        }}
      >
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    )
  }

  if (!account) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(tabs)/" />
}

