import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import type { ComponentProps } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { theme } from '@/theme/colors'

type IconName = ComponentProps<typeof Ionicons>['name']

interface InfosCardProps {
  title: string
  description: string
  icon: IconName
  /** Use para grid responsivo (ex.: width: '48%' em 2 colunas). */
  style?: ViewStyle
}

export function InfosCard({ title, description, icon, style }: InfosCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={28} color={theme.textInfos} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    maxWidth: '100%',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: theme.textInfos,
    /* Android: Text em row pode expandir; textAlign center centraliza dentro da caixa larga. */
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '600',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
})

