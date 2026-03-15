import { View, Pressable, Text, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { theme } from '@/theme/colors'

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}

export function Checkbox({ checked, onCheckedChange, label }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      style={styles.container}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
})
