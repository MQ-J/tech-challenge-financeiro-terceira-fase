import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  useWindowDimensions,
  Pressable,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  isTabletLayout,
  MAX_CONTENT_WIDTH,
  FOOTER_HEIGHT,
} from '@/constants/layout'
import { useRouter } from 'expo-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { InfosCard } from '@/components/InfosCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { TextInputField } from '@/components/TextInputField'
import { RegisterForm } from '@/components/RegisterForm'
import { theme } from '@/theme/colors'
import { useAccount } from '@/contexts/AccountContext'
import { useAuth } from '@/contexts/AuthContext'
import { firebaseAuthErrorMessage } from '@/lib/firebase-auth-messages'
import { setSecureItem } from '@/lib/storage'
import { FirebaseError } from 'firebase/app'

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const tablet = isTabletLayout(width)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterInfoModalOpen, setIsRegisterInfoModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { logout, login } = useAccount()
  const { signIn } = useAuth()

  const paddingH = tablet ? 32 : 16
  const heroDirection = tablet ? 'row' as const : 'column' as const
  const contentCentered = width > MAX_CONTENT_WIDTH
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - paddingH * 2
  const heroImageSizeHeight =
    tablet
      ? Math.max(320, Math.min(450, contentWidth * 0.55))
      : Math.max(150, Math.min(200, contentWidth * 0.75))
  
   const heroImageSizeWidth =
    tablet
      ? Math.max(450, Math.min(450, contentWidth * 0.55))
      : Math.max(320, Math.min(320, contentWidth * 0.75))
  const modalMaxWidth = tablet ? 440 : undefined
  const cardWidth = '48%' as const

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ao fechar o modal Entrar (qualquer forma), zera e-mail, senha e erros do formulário
  useEffect(() => {
    if (!isLoginModalOpen) {
      reset({ email: '', password: '' })
    }
  }, [isLoginModalOpen, reset])

  const onSubmit = async (data: LoginFormValues) => {
    const email = data.email.trim()
    try {
      setIsLoading(true)

      const accountFromFirebase = await signIn(email, data.password)
      const { transactions: _t, ...meta } = accountFromFirebase
      await setSecureItem('currentAccount', meta)

      setIsLoginModalOpen(false)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2:
          'Login efetuado com sucesso! Você está sendo redirecionado para a home.',
      })
      await login(accountFromFirebase)
      setTimeout(() => {
        router.replace('/(tabs)' as const)
      }, 500)
    } catch (err) {
      const message =
        err instanceof FirebaseError
          ? firebaseAuthErrorMessage(err.code, 'login')
          : 'Não foi possível entrar. Tente novamente.'
      Toast.show({
        type: 'error',
        text1: 'Erro ao fazer login',
        text2: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          styles.headerBlack,
          {
            paddingHorizontal: paddingH,
            paddingTop: Math.max(insets.top, tablet ? 16 : 12),
          },
          tablet && styles.headerTablet,
        ]}
      >
            <View style={styles.logoContainer}>
              <Ionicons
                name="business-outline"
                size={tablet ? 28 : 24}
                color={theme.defaultHome}
              />
              <Image
                source={require('@/assets/images/logo-destaque.png')}
                style={[
                  styles.logoImage,
                  { height: tablet ? 50 : 35, width: tablet ? 215 : 160 },
                ]}
                resizeMode="contain"
                accessibilityLabel="Logo Lumen Financial"
              />
            </View>
            <View style={styles.headerButtons}>
              <PrimaryButton
                label="Abra sua conta"
                iconName="person-add-outline"
                onPress={() => setIsRegisterInfoModalOpen(true)}
              />
              <PrimaryButton
                label="Entrar"
                variant="outline"
                iconName="log-in-outline"
                onPress={() => setIsLoginModalOpen(true)}
              />
            </View>
      </View>

      <View style={styles.gradientWrapper}>
        <LinearGradient
          colors={['rgba(84,0,87,1)', 'rgba(255,255,205,1)', 'rgba(255,255,255,1)']}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: paddingH,
              paddingBottom: FOOTER_HEIGHT + insets.bottom + (tablet ? 20 : 16),
              alignItems: contentCentered ? 'center' : 'stretch',
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              contentCentered && styles.contentCenterWrapper,
              contentCentered && { maxWidth: MAX_CONTENT_WIDTH },
            ]}
          >
          <View
            style={[
              styles.hero,
              {
                flexDirection: heroDirection,
                flexWrap: 'nowrap',
                marginBottom: tablet ? 28 : 20,
                minHeight: tablet ? 280 : undefined,
                alignItems: heroDirection === 'column' ? 'center' : 'center',
                justifyContent: heroDirection === 'column' ? 'flex-start' : 'space-between',
              },
            ]}
          >
            <Text
              style={[
                styles.heroText,
                {
                  marginRight: tablet ? 20 : 0,
                  marginBottom: tablet ? 0 : 16,
                  fontSize: tablet ? 18 : 16,
                  flex: tablet ? 1 : undefined,
                  alignSelf: heroDirection === 'column' ? 'stretch' : undefined,
                  textAlign: tablet ? 'left' : 'center',
                  paddingHorizontal: tablet ? 0 : 8,
                },
              ]}
            >
              Experimente mais liberdade no controle da sua vida financeira.
              {'\n'}
              Crie sua conta com a gente!
            </Text>
            <Image
              source={require('@/assets/images/pessoas.png')}
              style={[
                styles.heroImage,
                { width: heroImageSizeWidth, height: heroImageSizeHeight },
              ]}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { fontSize: tablet ? 20 : 18, marginBottom: tablet ? 20 : 16 },
            ]}
          >
            Vantagens do nosso banco
          </Text>

          <View style={styles.cardsGrid}>
            <InfosCard
              title="Conta e cartão gratuitos"
              icon="gift-outline"
              description="Conta digital sem custo fixo e sem tarifa de manutenção."
              style={{ width: cardWidth }}
            />
            <InfosCard
              title="Saques sem custo"
              icon="cash-outline"
              description="Quatro saques gratuitos por mês em qualquer Banco 24h."
              style={{ width: cardWidth }}
            />
            <InfosCard
              title="Programa de pontos"
              icon="star-outline"
              description="Acumule pontos com compras no crédito sem pagar mensalidade."
              style={{ width: cardWidth }}
            />
            <InfosCard
              title="Seguro Dispositivos"
              icon="phone-portrait-outline"
              description="Seus dispositivos protegidos por uma mensalidade simbólica."
              style={{ width: cardWidth }}
            />
          </View>

          </View>
        </ScrollView>
      </View>

      <View
        style={[
          styles.footer,
          styles.footerFixed,
          {
            paddingTop: tablet ? 20 : 16,
            paddingBottom: (tablet ? 20 : 16) + insets.bottom,
            paddingHorizontal: paddingH,
            alignItems: 'center',
          },
        ]}
      >
        <View style={styles.footerInner}>
          <View style={styles.footerColumnLeft}>
            <Text
              style={[
                styles.footerTitle,
                tablet && styles.footerTitleTablet,
              ]}
            >
              Serviços
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              Conta Corrente
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              Conta PJ
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              Cartão de Crédito
            </Text>
          </View>
          <View style={styles.footerColumnRight}>
            <Text
              style={[
                styles.footerTitle,
                tablet && styles.footerTitleTablet,
              ]}
            >
              Contatos
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              0800 486 345 02
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              suporte@lumenfinancial.com.br
            </Text>
            <Text
              style={[styles.footerText, tablet && styles.footerTextTablet]}
            >
              ouvidoria@lumenfinancial.com.br
            </Text>
          </View>
        </View>
      </View>

      {isMounted && (
        <>
          <Modal
            visible={isLoginModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setIsLoginModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsLoginModalOpen(false)}
              />
              <View
                style={[
                  styles.modalContent,
                  modalMaxWidth != null && { maxWidth: modalMaxWidth },
                ]}
              >
                <Text style={styles.modalTitle}>Acessar sua Conta</Text>
                <View style={{ marginTop: 16 }}>
                  <TextInputField
                    name="email"
                    control={control}
                    label="E-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    error={errors.email}
                    placeholder="seu@email.com"
                  />
                  <TextInputField
                    name="password"
                    control={control}
                    label="Senha"
                    secureTextEntry
                    autoCapitalize="none"
                    icon="lock-closed-outline"
                    error={errors.password}
                    placeholder="Digite a sua senha"
                  />
                  <PrimaryButton
                    label={isLoading ? 'Entrando...' : 'Entrar'}
                    onPress={handleSubmit(onSubmit)}
                    style={{ marginTop: 12, width: '100%' }}
                    disabled={isLoading}
                    iconName="log-in-outline"
                  />
                </View>
              </View>
              <View style={styles.toastOverlay} pointerEvents="box-none" collapsable={false}>
                <Toast />
              </View>
            </View>
          </Modal>

          <Modal
            visible={isRegisterInfoModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setIsRegisterInfoModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsRegisterInfoModalOpen(false)}
              />
              <View
                style={[
                  styles.modalContent,
                  modalMaxWidth != null && { maxWidth: modalMaxWidth },
                ]}
              >
                <Text style={styles.modalTitle}>Abrir nova Conta</Text>
                <Text style={styles.modalDescription}>
                  Preencha o formulário abaixo para se cadastrar.
                </Text>
                <RegisterForm
                  onSuccess={() => setIsRegisterInfoModalOpen(false)}
                />
              </View>
              <View style={styles.toastOverlay} pointerEvents="box-none" collapsable={false}>
                <Toast />
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerBlack: {
    backgroundColor: '#000',
  },
  headerTablet: {
    paddingBottom: 20,
  },
  gradientWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: '9%',
  },
  contentCenterWrapper: {
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    backgroundColor: 'transparent',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  logoTextTablet: {
    fontSize: 22,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  heroText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginRight: 12,
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#222',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  footer: {
    backgroundColor: '#000',
  },
  footerFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
  footerColumnLeft: {
    flex: 1,
    maxWidth: 280,
  },
  footerColumnRight: {
    flex: 1,
    maxWidth: 320,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    color: '#fff',
  },
  footerTitleTablet: {
    fontSize: 15,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
  },
  footerTextTablet: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  toastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    marginTop: 8,
  },
})

