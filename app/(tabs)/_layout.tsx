import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
  const insets = useSafeAreaInsets()
  const isWeb = Platform.OS === 'web'
  // Web costuma ter insets.bottom = 0; altura fixa baixa corta ícone + label.
  const tabBarBottom = Math.max(insets.bottom, isWeb ? 12 : 8)
  const tabBarInnerMin = isWeb ? 58 : 48

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#25292e',
          paddingTop: isWeb ? 10 : 8,
          paddingBottom: tabBarBottom,
          // minHeight em vez de height fixa: evita clipping dos labels no navegador
          minHeight: tabBarInnerMin + tabBarBottom + (isWeb ? 10 : 6),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="transacoes"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list-circle' : 'list-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  )
}
