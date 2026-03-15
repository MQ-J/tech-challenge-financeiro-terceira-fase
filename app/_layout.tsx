import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { AccountProvider } from '@/contexts/AccountContext'

export default function RootLayout() {
  return (
    <AccountProvider>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
      <StatusBar style="light" />
    </AccountProvider>
  )
}
