# 📱 Lumen Financial - Mobile

> Projeto desenvolvido como parte do Tech Challenge (Fase 3). Aplicação de gestão financeira em React Native (Expo), com **Firebase** (Authentication, Firestore, Storage), navegação e persistência local auxiliar (SecureStore / web).

---

## Tech Challenge - Fase 3: Requisitos do desafio

### Estrutura e requisitos das telas

#### Tela Principal (Dashboard)

- [x] Exibir informações do usuário logado e acesso às funcionalidades (home do canal).
- [x] Exibir gráficos e análises financeiras baseados nas transações do usuário.
- [x] Implementar animações para transições entre seções do dashboard utilizando Animated (React Native) ou animações nativas do Flutter.

#### Tela de Listagem de Transações

- [x] Permitir ao usuário visualizar uma lista de transações.
- [x] Filtros avançados (por data, tipo, busca textual).
- [x] Scroll infinito ou paginação para grandes volumes de dados — **paginação na UI** (10 itens por página, controles anterior/próxima quando há mais de 10 transações após os filtros).
- [x] Integrar a busca com Cloud Firestore para buscar as transações do usuário autenticado.

#### Tela de Adicionar/Editar Transação

- [x] Estrutura para adicionar novas transações e editar transações existentes.
- [x] Validação de campos com React Hook Form e Zod.
- [x] Validação avançada de valor, tipo e data da transação.
- [x] Upload de recibos/documentos (imagem ou PDF) no **Firebase Storage**, com URL em `receiptUrl`; remoção e exclusão da transação removem o arquivo quando aplicável.

---

### Tecnologias e conceitos a serem utilizados

#### React Native (Mobile)

- [x] React Native para criar a aplicação, com boas práticas de performance e usabilidade.
- [x] Uso de Expo para configuração inicial, navegação (Expo Router), acesso a APIs nativas e armazenamento seguro (expo-secure-store).

#### Gerenciamento de estado

- [x] Context API para gerenciar o estado global da aplicação, incluindo estado de autenticação e conta (AccountContext).

#### Segurança e armazenamento

- [x] Autenticação com **Firebase Auth** (e-mail/senha); persistência nativa com AsyncStorage via `initializeAuth`.
- [x] Armazenamento seguro local (Expo SecureStore com fallback para web) para metadados de sessão/conta.
- [x] **Firestore** (perfil `users/{uid}` + transações em `accounts/.../transactions`) e **Cloud Storage** (recibos em `receipts/{uid}/...`).

---

### Material para a entrega

- [x] Link do repositório Git do projeto.
- [x] README do projeto com informações para executá-lo em ambiente de desenvolvimento.
- [x] README + [Documentação Firebase](docs/firebase.md): configuração no Console, arquivos do projeto e passos para executar.
- [x] Vídeo demonstrativo de até 5 (cinco) minutos mostrando: login e autenticação; adicionar/editar transações; visualizar e filtrar transações; upload de anexos; integração com Firebase.

---

## 🔗 Acesso rápido (ambiente local)

Após iniciar o projeto (veja **Getting Started** abaixo):

| Plataforma | Comando / URL | Descrição |
| :--- | :--- | :--- |
| **📱 Expo Go** | `npx expo start` e escanear QR code | App no dispositivo físico. **Use a mesma rede Wi‑Fi do PC** (modo LAN); em dados móveis o QR costuma apontar para um IP local inacessível. Alternativa: `npx expo start --tunnel`. |
| **🌐 Web** | `npx expo start --web` → `http://localhost:8081` | Versão web (React Native Web). |
| **🤖 Android** | `npx expo start --android` | Emulador ou dispositivo Android. |
| **🍎 iOS** | `npx expo start --ios` | Simulador ou dispositivo iOS (macOS). |

---

## ✨ Funcionalidades implementadas

### 🔐 Autenticação e conta

- Tela de login com modal **Entrar** (e-mail e senha) via **Firebase Authentication**.
- Modal **Abra sua conta** com cadastro: cria usuário no Auth e documento inicial em **Firestore** `users/{uid}` (inclui `accountNumber` para a subcoleção de transações).
- Validação com Zod e React Hook Form; toasts de sucesso e erro (`react-native-toast-message`).
- Sessão Firebase: **web** com `getAuth`; **Android/iOS** com `initializeAuth` + persistência em **AsyncStorage**.

### 🏠 Navegação e layout

- **Expo Router** (file-based routing): rota inicial, `(auth)/login`, `(tabs)/` (Dashboard e Transações).
- Home pós-login com mensagem de boas-vindas e botão Sair.
- Aba **Transações** com listagem e estrutura para criar/editar transações; **paginação** na lista quando o resultado filtrado ultrapassa 10 itens (veja [Paginação na listagem de transações](#paginação-na-listagem-de-transações)).
- Layout responsivo: breakpoint de tablet em **480px** (reconhece Samsung Tab S FE e similares); hero em linha, grid de vantagens e footer centralizado em telas maiores.
- **Áreas seguras (notch / status bar / barra de gestos)**: `SafeAreaProvider` no layout raiz; login com `useSafeAreaInsets` no header e footer fixo; abas com `paddingBottom`/`height` da tab bar conforme inset inferior; Home e Transações com `SafeAreaView` no topo para não sobrepor hora e ícones do sistema.
- **Animações do dashboard**: API **`Animated`** do React Native (`react-native`), com **`useNativeDriver: true`** em opacidade e `translateY` (execução no thread nativo quando suportado). Entrada em sequência (stagger) na Home e fade + slide na aba Transações; as animações **rodam de novo sempre que a aba ganha foco**, usando **`useIsFocused`** do pacote **`@react-navigation/native`** (já trazido pelo Expo Router / React Navigation). Não há pacote separado “native-animated”: o recurso faz parte do core do React Native.

### 📦 Dados e estado

- **AccountContext**: após login, hidrata conta a partir de **Firestore** (`users/{uid}`) e subcoleção **`accounts/{accountNumber}/transactions`**; mutações sincronizam Firestore e espelho em `users/{uid}`.
- **AuthContext**: `signIn` / `signUp` com Firebase Auth + perfil Firestore no cadastro.
- Tipos em `lib/types.ts`; integração Firebase detalhada na [Documentação Firebase](docs/firebase.md).

### Paginação na listagem de transações

- **Onde:** componente `components/TransactionsList.tsx` (aba **Transações**).
- **Regra:** até **10** transações no resultado (após filtros de tipo, data e busca por texto) — a lista se comporta como antes, **sem** barra de paginação. Com **11 ou mais**, aparece uma barra inferior com **anterior / “Página X de Y” / próximo**; cada página mostra no máximo **10** itens.
- **Implementação:** paginação **no cliente**, sobre o array `account.transactions` já carregado (o contexto continua usando `fetchAllTransactions` em `AccountContext` / `lib/firestore.ts`). Os filtros de texto continuam apenas no app; tipo e intervalo de datas são aplicados em memória na lista.
- **Firestore (opcional / futuro):** em `lib/firestore.ts`, a função `fetchTransactions` já suporta leitura paginada por cursor (`limit`, `orderBy`, `startAfter`) com `PAGE_SIZE = 10` alinhado à regra da tela; a UI da aba Transações ainda não consome essa função — evita múltiplas leituras só quando for ligada à lista.

---

## 🛠 Tecnologias utilizadas

| Área | Tecnologias |
| :--- | :--- |
| **Core** | React 19, React Native 0.81, Expo SDK 54 |
| **Linguagem** | TypeScript 5 |
| **Navegação** | Expo Router 6, React Navigation 7 (`@react-navigation/native`, bottom tabs) |
| **Animações (dashboard)** | React Native `Animated` + `useNativeDriver`; foco de aba com `useIsFocused` (`@react-navigation/native`) |
| **Formulários e validação** | React Hook Form, Zod, @hookform/resolvers |
| **Estado** | Context API (AccountContext) |
| **Backend / cloud** | **Firebase** (`firebase` SDK: Auth, Firestore, Storage) |
| **Segurança / local** | expo-secure-store, crypto-js (storage local); `react-native-bcrypt` em utilitários legados |
| **UI e feedback** | expo-linear-gradient, react-native-toast-message, @expo/vector-icons, react-native-svg, react-native-gifted-charts |
| **Layout** | React Native StyleSheet, breakpoint tablet (constants/layout), `react-native-safe-area-context` (SafeAreaProvider / SafeAreaView / insets) |
| **Outras libs RN (Expo)** | `react-native-reanimated` (stack Expo; animações do dashboard usam `Animated` nativo) |

---

## 🚀 Getting Started – Como executar o projeto

### Pré-requisitos

- Node.js >= 18
- npm >= 8
- [Expo Go](https://expo.dev/go) instalado no celular (para testar no dispositivo) ou emulador Android/iOS

### Instalação e execução

```bash
# Clone o repositório (se ainda não tiver)
git clone <url-do-repositorio>

# Instalar dependências
npm install

# Iniciar o app (Expo)
npx expo start
```

Utilize o QR code no terminal para abrir no **Expo Go** ou as teclas do CLI para abrir em **web**, **Android** ou **iOS**.

### Firebase (obrigatório para login, transações e recibos)

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative **Authentication** (e-mail/senha), **Firestore** e **Storage**.
2. Copie as chaves do SDK para `firebase/config.ts` (ou use variáveis `EXPO_PUBLIC_*` se o grupo adotar `.env`).
3. Publique as **regras do Storage** conforme o arquivo `firebase/storage.rules` (Console → Storage → Rules).
4. Configure **regras do Firestore** (perfil `users/{uid}` e subcoleção `accounts/{accountId}/transactions`) — exemplo no guia abaixo.

**Guia passo a passo (Console, modelo de dados, arquivos `lib/` e regras):**  
[Documentação Firebase](docs/firebase.md)

---

## 📂 Estrutura do projeto

Formato enxuto, no estilo do desafio:

```text
tech-challenge-financeiro-terceira-fase/
├── docs/
│   └── firebase.md         # Console Firebase, Firestore/Storage, arquivos relacionados
├── firebase/
│   ├── config.ts                 # initializeApp + Auth (web vs native persistence)
│   └── storage.rules             # Regras Storage (publicar no Console ou deploy CLI)
├── app/                          # Rotas (Expo Router)
│   ├── _layout.tsx               # Layout raiz (Stack, AccountProvider, Toast)
│   ├── index.tsx                 # Redireciona para login ou (tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx           # Stack sem header (auth)
│   │   └── login.tsx             # Tela de login + modais Entrar / Abra sua conta
│   └── (tabs)/
│       ├── _layout.tsx           # Bottom tabs (Dashboard, Transações)
│       ├── index.tsx             # Home pós-login (Dashboard)
│       └── transacoes.tsx       # Listagem e criação de transações
├── components/                   # Componentes reutilizáveis
│   ├── RegisterForm.tsx          # Formulário de cadastro (Zod + RHF)
│   ├── TextInputField.tsx        # Input com ícone e erro
│   ├── PrimaryButton.tsx         # Botão primário/outline
│   ├── InfosCard.tsx             # Card de vantagens (login)
│   ├── Checkbox.tsx              # Checkbox termos
│   ├── TransactionsList.tsx      # Lista de transações, filtros e paginação (10/página)
│   └── ...
├── contexts/
│   ├── AccountContext.tsx        # Conta, sync Firestore + Storage (transações)
│   └── AuthContext.tsx           # Firebase Auth + perfil inicial Firestore
├── lib/
│   ├── firebase.ts               # getFirestore + getStorage (mesmo app que config.ts)
│   ├── firestore.ts              # Transações na subcoleção + espelho users/{uid}
│   ├── user-account-from-firestore.ts
│   ├── receipt-storage.ts        # Upload / delete de recibos no Storage
│   ├── firebase-auth-messages.ts
│   ├── storage.ts                # SecureStore + fallback web (metadados locais)
│   ├── types.ts
│   ├── auth.ts                   # Utilitários bcrypt (legado)
│   └── …
├── constants/
│   └── layout.ts                 # TABLET_BREAKPOINT, MAX_CONTENT_WIDTH, FOOTER_HEIGHT
├── assets/                       # Imagens e recursos
├── package.json
└── README.md
```

---

## 📜 Scripts Disponíveis

### Aplicação (Expo)
```bash
npm run start     # Inicia o Expo (npx expo start)
npm run android   # Inicia e abre no emulador/dispositivo Android
npm run ios       # Inicia e abre no simulador/dispositivo iOS
npm run web       # Inicia e abre no navegador (atalho para npx expo start --web)
npm run lint      # Executa linting (expo lint)
npx expo start -c # Inicia o Expo limpando o cache (útil para resolver problemas de build/cache)
```
