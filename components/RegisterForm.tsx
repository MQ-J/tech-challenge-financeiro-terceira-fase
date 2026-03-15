import { useState } from 'react'
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInputField } from '@/components/TextInputField'
import { PrimaryButton } from '@/components/PrimaryButton'
import { Checkbox } from '@/components/Checkbox'
import { mockAccounts } from '@/lib/mock-data'
import { getSecureItem, setSecureItem } from '@/lib/storage'
import { hashPassword } from '@/lib/auth'
import type { Account } from '@/lib/types'

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

    let list: Account[]

    try {
      const storedList =
        (await getSecureItem<Account[]>('accountsList')) || mockAccounts
      list =
        Array.isArray(storedList) && storedList.length > 0
          ? storedList
          : mockAccounts
    } catch {
      list = mockAccounts
    }

    const accountExists = list.some((account) => account.email === data.email)

    if (accountExists) {
      Alert.alert(
        'Não é possível fazer o cadastro com o e-mail solicitado',
        'Este e-mail já está em uso.',
      )
      setIsLoading(false)
      return
    }

    const randomNumber = Math.floor(Math.random() * 10000)
    const randomString = randomNumber.toString().padStart(4, '0') + '-1'

    const hashedPassword = await hashPassword(data.password)

    const newAccount: Account = {
      balance: 0,
      accountNumber: randomString,
      userName: data.nome,
      email: data.email,
      password: hashedPassword,
      transactions: [],
    }

    list.push(newAccount)
    await setSecureItem('accountsList', list)

    Alert.alert(
      'Conta criada com sucesso!',
      'Efetue o login para acessar sua nova conta',
    )

    setIsLoading(false)

    setTimeout(() => {
      onSuccess()
      reset()
      clearErrors()
    }, 1500)
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
    maxHeight: 340,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  form: {
    marginTop: 8,
  },
  termsRow: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
    marginBottom: 12,
  },
  buttonRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    width: '100%',
  },
})
