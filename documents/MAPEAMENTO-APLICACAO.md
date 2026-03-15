# Mapeamento da Aplicação – Lumen Financial Mobile

Documento gerado a partir do mapeamento do repositório. Descreve o que é o projeto, para que serve, o que faz atualmente e quais tecnologias são utilizadas.

---

## 1. O que é o projeto

**Nome:** Lumen Financial – Mobile (tech-challenge-financeiro-terceira-fase)

É uma aplicação **mobile de gerenciamento financeiro** desenvolvida em **React Native** com **Expo**, criada no contexto do **Tech Challenge** da terceira fase da pós-graduação em **Front-End Engineering** da **Pós Tech**. O foco é aplicar conceitos das disciplinas do curso (navegação, segurança, autenticação, armazenamento em nuvem) em um app que gerencia transações financeiras.

---

## 2. Para que serve

O projeto serve para:

- **Aprendizado e entrega do desafio:** atender aos requisitos do desafio técnico (dashboard, listagem de transações, adicionar/editar transações, upload de recibos, integração com Firebase).
- **Prática de React Native/Expo:** uso de Expo para configuração rápida, navegação, APIs nativas e integração planejada com Firebase.
- **Demonstração de funcionalidades:** login/autenticação, CRUD de transações, filtros, upload de anexos e uso de Firestore/Storage (conforme proposta do README).

---

## 3. O que a aplicação faz (estado atual)

### 3.1 Estrutura de telas e navegação

- **Navegação:** file-based routing com **Expo Router**.
- **Layout raiz:** `Stack` com uma tela `(tabs)` sem header.
- **Abas (tabs):**
  - **Dashboard** (`app/(tabs)/index.tsx`): tela inicial.
  - **Transações** (`app/(tabs)/transacoes.tsx`): listagem de transações.
- **Tela 404:** `app/+not-found.tsx` – “Oops! Not Found” com link para voltar.

### 3.2 Dashboard (index)

- **Comportamento atual:** tela de demonstração do tutorial Expo (escolher foto, colar emoji, salvar na galeria).
- **Componentes usados:** `ImageViewer`, `Button`, `IconButton`, `CircleButton`, `EmojiPicker`, `EmojiList`, `EmojiSticker`.
- **Recursos:** `expo-image-picker`, `expo-media-library`, `react-native-view-shot`, `react-native-gesture-handler`.
- **Estado:** não há gráficos financeiros nem dados reais; a tela ainda não implementa o dashboard financeiro descrito no desafio.

### 3.3 Transações

- **Comportamento atual:** lista estática de valores em reais exibida via `FlatList` (`FlatListBasics`).
- **Dados:** array fixo no código (ex.: R$ 50,00, -R$ 20,40, etc.).
- **Estado:** sem filtros, paginação, Firestore ou tela de adicionar/editar transação.

### 3.4 Componentes reutilizáveis

| Componente       | Uso principal                          |
|------------------|----------------------------------------|
| `Button`         | Botões com tema primary ou padrão      |
| `ImageViewer`    | Exibição de imagem (expo-image)        |
| `IconButton`     | Botão com ícone (ex.: Reset, Save)    |
| `CircleButton`   | Botão circular (ex.: adicionar sticker)|
| `EmojiPicker`    | Modal de seleção de emoji              |
| `EmojiList`      | Lista de emojis no picker              |
| `EmojiSticker`   | Emoji sobre a imagem                   |
| `FlatListBasics` | Lista de valores na tela Transações   |

### 3.5 O que ainda não está implementado (conforme README)

- Login e autenticação.
- Dashboard com gráficos e análises financeiras reais.
- Animações no dashboard (Animated).
- Filtros avançados (data, categoria) e scroll infinito/paginação.
- Integração com Cloud Firestore para transações do usuário.
- Tela de adicionar/editar transação com validação.
- Upload de recibos/documentos no Firebase Storage.
- Context API para estado global (autenticação e transações).
- Configuração e uso de Firebase no projeto (não há dependências Firebase no `package.json`).

---

## 4. Tecnologias utilizadas

### 4.1 Core

| Tecnologia        | Versão   | Uso                                      |
|-------------------|----------|------------------------------------------|
| React             | 19.1.0   | Biblioteca UI                            |
| React Native      | 0.81.5   | App mobile                               |
| React DOM         | 19.1.0   | Suporte web (Expo)                       |
| TypeScript        | ~5.9.2   | Tipagem estática                         |
| Expo              | ~54.0.33 | SDK e tooling (build, dev, plugins)      |

### 4.2 Navegação e UI

| Pacote                         | Uso                          |
|--------------------------------|------------------------------|
| expo-router                    | Roteamento file-based        |
| @react-navigation/native       | Base da navegação            |
| @react-navigation/bottom-tabs  | Abas inferiores              |
| @react-navigation/elements     | Elementos de UI da navegação |
| react-native-screens           | Telas nativas                |
| react-native-safe-area-context | Safe area                    |

### 4.3 Expo (APIs e recursos)

| Pacote               | Uso                          |
|----------------------|------------------------------|
| expo-constants       | Constantes do app            |
| expo-font            | Fontes                       |
| expo-image           | Componente Image otimizado   |
| expo-image-picker    | Escolher imagem da galeria   |
| expo-media-library   | Salvar/acessar mídia         |
| expo-splash-screen   | Tela de splash               |
| expo-status-bar      | Barra de status              |
| expo-linking         | Deep links                   |
| expo-web-browser     | Abrir URLs no navegador      |
| expo-haptics         | Feedback háptico             |
| @expo/vector-icons   | Ícones (Ionicons, FontAwesome)|

### 4.4 Gestos e animação

| Pacote                     | Uso                    |
|----------------------------|------------------------|
| react-native-gesture-handler | Gestos                |
| react-native-reanimated    | Animações              |
| react-native-worklets      | Worklets (Reanimated)  |

### 4.5 Outros

| Pacote                  | Uso                          |
|-------------------------|------------------------------|
| react-native-view-shot  | Captura de view (ex.: salvar imagem) |
| react-native-web        | Build para web               |
| ESLint + eslint-config-expo | Lint                    |

### 4.6 Configuração do app

- **app.json:** nome, slug, ícones, splash, plugins (expo-router, expo-splash-screen), suporte Android/iOS/Web, Nova Arquitetura habilitada, typed routes e React Compiler em experiments.
- **tsconfig.json:** base Expo, `strict: true`, alias `@/*` para raiz do projeto.

---

## 5. Estrutura de pastas (resumo)

```
tech-challenge-financeiro-terceira-fase/
├── app/
│   ├── _layout.tsx           # Layout raiz (Stack)
│   ├── +not-found.tsx        # Tela 404
│   └── (tabs)/
│       ├── _layout.tsx       # Layout das abas (Dashboard, Transações)
│       ├── index.tsx         # Dashboard (demo image/emoji)
│       └── transacoes.tsx    # Listagem de transações
├── components/
│   ├── Button.tsx
│   ├── CircleButton.tsx
│   ├── EmojiList.tsx
│   ├── EmojiPicker.tsx
│   ├── EmojiSticker.tsx
│   ├── FlatListBasics.tsx
│   ├── IconButton.tsx
│   └── ImageViewer.tsx
├── assets/                   # Imagens (icon, splash, favicon, etc.)
├── documents/                # Documentação (este mapeamento)
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. Como executar (resumo)

1. `npm install`
2. `npx expo start` (ou `npm start`) e abrir no Expo Go.

Comandos adicionais: `npm run android`, `npm run ios`, `npm run web`, `npm run lint`.

---

*Documento gerado a partir do mapeamento do código em março de 2025.*
