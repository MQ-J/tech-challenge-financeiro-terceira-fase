/** Mensagens em português para códigos `auth/*` do Firebase. */

export function firebaseAuthErrorMessage(
  code: string,
  flow: 'register' | 'login' = 'register',
): string {
  if (flow === 'login') {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'E-mail ou senha incorretos.'
      case 'auth/user-not-found':
        return 'Não encontramos uma conta com este e-mail.'
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.'
      case 'auth/invalid-email':
        return 'E-mail inválido.'
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde um pouco e tente de novo.'
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.'
      case 'auth/configuration-not-found':
        return 'Authentication não está ativo no Firebase Console (veja docs/firebase-phase-a1-console.md).'
      case 'auth/invalid-api-key':
        return 'API Key inválida ou de outro projeto. Confira Configurações do projeto → app Web.'
      default:
        return 'Não foi possível entrar. Tente novamente.'
    }
  }

  switch (code) {
    case 'auth/configuration-not-found':
      return 'Authentication não está ativo no Firebase Console (veja docs/firebase-phase-a1-console.md).'
    case 'auth/invalid-api-key':
      return 'API Key inválida ou de outro projeto. Confira Configurações do projeto → app Web.'
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/weak-password':
      return 'Senha muito fraca. Use pelo menos 6 caracteres.'
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.'
    default:
      return 'Não foi possível concluir o cadastro. Tente novamente.'
  }
}
