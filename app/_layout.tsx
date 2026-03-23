import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AccountProvider } from '@/contexts/AccountContext'
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AccountProvider>
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
          <StatusBar style="light" />
        </AccountProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
