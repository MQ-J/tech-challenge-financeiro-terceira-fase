import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FirebaseError } from 'firebase/app'
import { firebaseAuthErrorMessage } from '@/lib/firebase-auth-messages'
import { TextInputField } from '@/components/TextInputField'
import { PrimaryButton } from '@/components/PrimaryButton'
import { Checkbox } from '@/components/Checkbox'
import { useAuth } from '@/contexts/AuthContext'

const registerSchema = z
  .object({
    nome: z
      .string()
      .min(1, { message: 'O nome é obrigatório.' })
      .refine(
        (nome) => nome.trim().split(/\s+/).length >= 2,
        { message: 'Digite seu nome completo.' },
      ),
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
    confirmPassword: z.string().min(1, { message: 'Confirme sua senha.' }),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos para criar a conta.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const termsAccepted = watch('terms')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const nome = watch('nome')
  const email = watch('email')

  const passwordsMatch =
    password === confirmPassword && password !== '' && confirmPassword !== ''
  const nomeCompleto =
    (nome?.trim().split(/\s+/).filter((word) => word.length > 0).length ?? 0) >= 2
  const emailValido =
    !errors.email && !!email && email.includes('@') && email.includes('.')

  const isSubmitDisabled =
    !termsAccepted || !passwordsMatch || !nomeCompleto || !emailValido || isLoading

  async function handleRegister(data: RegisterFormValues) {
    setIsLoading(true)

    try {
      await signUp(data.email, data.password, {
        userName: data.nome.trim(),
        onRegistered: () => {
          Toast.show({
            type: 'success',
            text1: 'Conta criada com sucesso!',
            text2: 'O (a) cliente já pode realizar o login.',
          })
          onSuccess()
          reset()
          clearErrors()
        },
      })
    } catch (e) {
      const message =
        e instanceof FirebaseError
          ? firebaseAuthErrorMessage(e.code, 'register')
          : 'Não foi possível concluir o cadastro. Tente novamente.'
      Toast.show({
        type: 'error',
        text1: 'Cadastro',
        text2: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <TextInputField
            name="nome"
            control={control}
            label="Nome"
            placeholder="Digite seu nome completo"
            icon="person-outline"
            error={errors.nome}
            autoCapitalize="words"
          />
          <TextInputField
            name="email"
            control={control}
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={errors.email}
          />
          <TextInputField
            name="password"
            control={control}
            label="Senha"
            placeholder="Digite a sua senha"
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            error={errors.password}
          />
          <TextInputField
            name="confirmPassword"
            control={control}
            label="Confirmar senha"
            placeholder="Digite a sua senha novamente"
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <View style={styles.termsRow}>
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setValue('terms', checked, { shouldValidate: true })
              }
              label="Eu aceito os termos e condições."
            />
          </View>
          {errors.terms?.message ? (
            <Text style={styles.errorText}>{errors.terms.message}</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label={isLoading ? 'Criando conta...' : 'Criar conta'}
          onPress={handleSubmit(handleRegister)}
          style={styles.submitButton}
          disabled={isSubmitDisabled}
          iconName="person-add-outline"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 200,
  },
  scroll: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  form: {
    marginTop: 8,
  },
  termsRow: {
    marginBottom: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
    marginBottom: 12,
  },
  buttonRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    width: '100%',
  },
})
