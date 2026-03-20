import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AccountProvider } from '@/contexts/AccountContext'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <Toast />
        <StatusBar style="light" />
      </AccountProvider>
    </SafeAreaProvider>
  )
}
