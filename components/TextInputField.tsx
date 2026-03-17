import Ionicons from '@expo/vector-icons/Ionicons'
import { Control, Controller, FieldError } from 'react-hook-form'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'

interface TextInputFieldProps extends TextInputProps {
  name: string
  control: Control<any>
  label?: string
  icon?: React.ComponentProps<typeof Ionicons>['name']
  error?: FieldError
}

export function TextInputField({
  name,
  control,
  label,
  icon,
  error,
  ...rest
}: TextInputFieldProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color="#888"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#999"
              {...rest}
            />
          )}
        />
      </View>
      {error?.message ? (
        <Text style={styles.error}>{error.message}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: 'red',
  },
})

