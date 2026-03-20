# 📱 Lumen Financial - Mobile

> Projeto desenvolvido como parte do Tech Challenge (Fase 3). Uma aplicação de gerenciamento financeiro em React Native (Expo), com autenticação, navegação e armazenamento seguro (local seguro; cloud previsto para integração com Firebase).

---

## Tech Challenge - Fase 3: Requisitos do desafio

### Estrutura e requisitos das telas

#### Tela Principal (Dashboard)

- [x] Exibir informações do usuário logado e acesso às funcionalidades (home do canal).
- [x] Exibir gráficos e análises financeiras baseados nas transações do usuário.
- [x] Implementar animações para transições entre seções do dashboard utilizando Animated (React Native) ou animações nativas do Flutter.

#### Tela de Listagem de Transações

- [ ] Permitir ao usuário visualizar uma lista de transações.
- [ ] Filtros avançados (por data, categoria, etc.).
- [ ] Scroll infinito ou paginação para grandes volumes de dados.
- [ ] Integrar a busca com Cloud Firestore para buscar as transações do usuário autenticado.

#### Tela de Adicionar/Editar Transação

- [ ] Estrutura para adicionar novas transações e editar transações existentes.
- [ ] Validação de campos com React Hook Form e Zod.
- [ ] Validação avançada de valor e categoria da transação.
- [ ] Upload de Recibos: permitir o upload de recibos ou documentos relacionados à transação, salvando-os no Firebase Storage.

---

### Tecnologias e conceitos a serem utilizados

#### React Native (Mobile)

- [x] React Native para criar a aplicação, com boas práticas de performance e usabilidade.
- [x] Uso de Expo para configuração inicial, navegação (Expo Router), acesso a APIs nativas e armazenamento seguro (expo-secure-store).

#### Gerenciamento de estado

- [x] Context API para gerenciar o estado global da aplicação, incluindo estado de autenticação e conta (AccountContext).

#### Segurança e armazenamento

- [x] Autenticação com senha hasheada (bcrypt) e persistência de sessão.
- [x] Armazenamento seguro (Expo SecureStore com fallback para web).
- [ ] Integração com Firebase (Firestore e Storage) para dados em cloud (previsto).

---

### Material para a entrega

- [x] Link do repositório Git do projeto.
- [x] README do projeto com informações para executá-lo em ambiente de desenvolvimento.
- [ ] README incluindo configuração do Firebase, dependências necessárias e passos para executar (quando Firebase for integrado).
- [ ] Vídeo demonstrativo de até 5 (cinco) minutos mostrando: login e autenticação; adicionar/editar transações; visualizar e filtrar transações; upload de anexos; integração com Firebase.

---

## 🔗 Acesso rápido (ambiente local)

Após iniciar o projeto (veja **Getting Started** abaixo):

| Plataforma | Comando / URL | Descrição |
| :--- | :--- | :--- |
| **📱 Expo Go** | `npx expo start` e escanear QR code | App no dispositivo físico. |
| **🌐 Web** | `npx expo start --web` → `http://localhost:8081` | Versão web (React Native Web). |
| **🤖 Android** | `npx expo start --android` | Emulador ou dispositivo Android. |
| **🍎 iOS** | `npx expo start --ios` | Simulador ou dispositivo iOS (macOS). |

---

## ✨ Funcionalidades implementadas

### 🔐 Autenticação e conta

- Tela de login com modal **Entrar** (e-mail e senha).
- Modal **Abra sua conta** com formulário de cadastro (nome completo, e-mail, senha, confirmação, termos).
- Validação com Zod e React Hook Form; senhas hasheadas com bcrypt; verificação de e-mail já cadastrado.
- Toasts de sucesso e erro (react-native-toast-message); redirecionamento para a home após login.
- Persistência de sessão com Expo SecureStore (e fallback em `localStorage` na web).

### 🏠 Navegação e layout

- **Expo Router** (file-based routing): rota inicial, `(auth)/login`, `(tabs)/` (Dashboard e Transações).
- Home pós-login com mensagem de boas-vindas e botão Sair.
- Aba **Transações** com listagem e estrutura para criar/editar transações.
- Layout responsivo: breakpoint de tablet em **480px** (reconhece Samsung Tab S FE e similares); hero em linha, grid de vantagens e footer centralizado em telas maiores.
- **Animações do dashboard**: API **`Animated`** do React Native (`react-native`), com **`useNativeDriver: true`** em opacidade e `translateY` (execução no thread nativo quando suportado). Entrada em sequência (stagger) na Home e fade + slide na aba Transações; as animações **rodam de novo sempre que a aba ganha foco**, usando **`useIsFocused`** do pacote **`@react-navigation/native`** (já trazido pelo Expo Router / React Navigation). Não há pacote separado “native-animated”: o recurso faz parte do core do React Native.

### 📦 Dados e estado

- **AccountContext**: conta logada, login, logout e hidratação do storage.
- Tipos e dados mock em `lib`; armazenamento seguro de lista de contas.

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
| **Segurança** | react-native-bcrypt, expo-secure-store, crypto-js |
| **UI e feedback** | expo-linear-gradient, react-native-toast-message, @expo/vector-icons, react-native-svg, react-native-gifted-charts |
| **Layout** | React Native StyleSheet, breakpoint tablet (constants/layout) |
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
cd tech-challenge-financeiro-terceira-fase

# Instalar dependências
npm install

# Iniciar o app (Expo)
npx expo start
```

A partir daí, use o QR code no terminal para abrir no **Expo Go** ou as teclas do CLI para abrir em **web**, **Android** ou **iOS**.

---

## 📂 Estrutura do projeto

Formato enxuto, no estilo do desafio:

```text
tech-challenge-financeiro-terceira-fase/
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
│   ├── FlatListBasics.tsx        # Lista de transações
│   └── ...
├── contexts/
│   └── AccountContext.tsx        # Estado global (conta, login, logout)
├── lib/                          # Utilitários e dados
│   ├── auth.ts                   # bcrypt (hash, compare, migrate)
│   ├── storage.ts                # SecureStore + fallback web
│   ├── types.ts                  # Tipos (Account, etc.)
│   └── mock-data.ts              # Contas e dados iniciais
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
