import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: '',
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false, title: '' }} />
    </Stack>
  )
}
