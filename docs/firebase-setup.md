# Firebase – Configuração do Projeto

Este guia descreve o que foi configurado no **Firebase Console** e como o código do app se conecta a **Authentication**, **Cloud Firestore** e **Cloud Storage**. Use-o junto do [README](../README.md) para rodar o projeto em equipe ou em avaliação.

---

## 1. Arquivo `firebase/config.ts`

É o ponto único de inicialização do **Firebase App** e do **Auth**:

- Lê o objeto **`firebaseConfig`** (valores copiados do Console em **Configurações do projeto → Seus apps → SDK**).
- Garante um único `initializeApp` (`getApps().length`).
- **Web:** `getAuth(app)`.
- **Android / iOS (React Native):** `initializeAuth` com **`getReactNativePersistence(AsyncStorage)`** para a sessão sobreviver ao fechamento do app.

Estrutura esperada do `firebaseConfig` (substitua pelos valores do seu projeto):

```ts
const firebaseConfig = {
  apiKey: '…',
  authDomain: 'SEU-PROJETO.firebaseapp.com',
  projectId: 'SEU-PROJETO',
  storageBucket: 'SEU-PROJETO.firebasestorage.app',
  messagingSenderId: '…',
  appId: '…',
  measurementId: '…', // opcional (Analytics)
}
```

**Segurança em repositório:** em produção ou trabalhos acadêmicos com repositório público, prefira variáveis de ambiente (`EXPO_PUBLIC_*`) e **não** commitar chaves. O cliente Firebase ainda assim expõe a `apiKey` no bundle; a proteção real vem das **regras** do Firestore/Storage e do **Auth**.

---

## 2. Módulos em `lib/` ligados ao Firebase

| Arquivo | Função |
| :--- | :--- |
| **`lib/firebase.ts`** | Exporta **`db`** (`getFirestore(app)`) e **`storage`** (`getStorage(app)`), usando o mesmo `app` importado de `@/firebase/config` para não haver dois `initializeApp`. |
| **`lib/firestore.ts`** | CRUD na subcoleção **`accounts/{accountNumber}/transactions`**, leitura paginada opcional (`fetchTransactions`), carga completa (`fetchAllTransactions`), espelho financeiro em **`users/{uid}`** (`updateUserProfileFinancials`), e `deleteField` ao remover `receiptUrl`. |
| **`lib/user-account-from-firestore.ts`** | Lê o documento **`users/{uid}`** e monta o tipo **`Account`** usado no app. |
| **`lib/receipt-storage.ts`** | Upload de recibos (`uploadBytes` + `getDownloadURL`) no path **`receipts/{uid}/{accountNumber}/{transactionId}/…`** e exclusão por URL de download (`deleteReceiptFromFirebaseIfPresent`). |
| **`lib/firebase-auth-messages.ts`** | Tradução / mapeamento de códigos de erro do Firebase Auth para mensagens amigáveis na UI (quando utilizado). |

Outros arquivos em `lib/` (`format.ts`, `transaction-schema.ts`, `types.ts`, etc.) não são específicos do Firebase, mas definem tipos e validações usados nas telas integradas.

**Contextos:**

- **`contexts/AuthContext.tsx`** – `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, gravação inicial do perfil em **`users/{uid}`** no cadastro.
- **`contexts/AccountContext.tsx`** – `onAuthStateChanged`, merge com transações da subcoleção, mutações com sync Firestore + Storage (recibos).

---

## 3. Arquivo `firebase/storage.rules`

Este arquivo é a **fonte versionada** das regras de segurança do **Cloud Storage**. Ele **não** é aplicado automaticamente só por existir no repositório: é preciso **colar/publicar** no Console (**Storage → Rules**) ou fazer deploy com **Firebase CLI** (`firebase deploy --only storage`).

Comportamento resumido do que está no projeto:

- Somente objetos sob o prefixo **`receipts/{userId}/...`** são tratados.
- **Leitura, escrita e exclusão** exigem usuário autenticado com **`request.auth.uid == userId`** (cada usuário só acessa a própria pasta).
- **Criação/atualização:** limite de **10 MB** e tipo **`image/*`** ou **`application/pdf`**.

Ajuste limites e tipos conforme a necessidade do desafio ou produção.

---

## 4. O que fazer no Firebase Console

### 4.1 Criar o projeto

1. Acesse [Firebase Console](https://console.firebase.google.com/).
2. **Adicionar projeto** (ou use um existente).
3. Registre um app **Web** (ícone `</>`) para obter o objeto de configuração usado em `firebase/config.ts`.

### 4.2 Authentication

1. **Build → Authentication → Começar**.
2. Em **Sign-in method**, habilite **E-mail/senha** (primeiro fator).
3. Nenhuma configuração extra é obrigatória para o fluxo atual do app (cadastro + login com e-mail e senha).

### 4.3 Cloud Firestore

1. **Build → Firestore Database → Criar banco**.
2. Escolha modo **produção** ou **teste** (em teste as regras expiram em 30 dias).
3. Modele os dados conforme o app:

| Caminho | Conteúdo |
| :--- | :--- |
| **`users/{uid}`** | Perfil: `userName`, `email`, `accountNumber`, `balance`, `transactions` (espelho opcional das transações). |
| **`accounts/{accountNumber}/transactions/{transactionId}`** | Documento da transação: `type`, `amount`, `date`, `description?`, `receiptUrl?`. |

O **`accountNumber`** é gerado no cadastro (`AuthContext`) e precisa ser **o mesmo** usado na subcoleção `accounts/.../transactions`.

4. **Regras de segurança (exemplo alinhado ao app)**  
   Ajuste para o seu ambiente. Exemplo que amarra a subcoleção ao perfil do usuário:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /accounts/{accountId}/transactions/{txId} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.accountNumber == accountId;
    }
  }
}
```

Em aulas com prazo curto, às vezes usam-se regras temporárias permissivas; **não use em produção**. Publique sempre em **Firestore → Rules**.

### 4.4 Cloud Storage

1. **Build → Storage → Começar** e conclua o assistente (bucket padrão).
2. Em **Rules**, publique o conteúdo equivalente ao arquivo **`firebase/storage.rules`** deste repositório (copiar/colar e **Publicar**).
3. Sem isso, uploads retornam **permission denied** mesmo com o código correto.

### 4.5 CORS (somente **web** no navegador)

Se o upload na **web** falhar por CORS, configure CORS no bucket conforme a [documentação do Google Cloud Storage para Firebase](https://firebase.google.com/docs/storage/web/download-files#cors_configuration). Em **Expo Go no dispositivo**, o fluxo não passa pelo mesmo CORS do browser.

---

## 5. Modelo mental do fluxo

1. **Cadastro:** Auth cria usuário → app grava **`users/{uid}`** com `accountNumber`.
2. **Login:** Auth autentica → app lê **`users/{uid}`** e carrega **`accounts/{accountNumber}/transactions`** (ordenação por `date`).
3. **Transações:** create/update/delete atualizam a subcoleção e o espelho em **`users/{uid}`** (saldo e lista resumida).
4. **Recibos:** upload para **`receipts/{uid}/...`**; URL salva em `receiptUrl` na transação; exclusão remove o arquivo no Storage quando o recibo é removido ou a transação é apagada.

---

## 6. Referências rápidas

- [Firebase – Documentação](https://firebase.google.com/docs)
- [Firestore – regras](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage – regras](https://firebase.google.com/docs/storage/security)
- [Auth – e-mail/senha](https://firebase.google.com/docs/auth/web/password-auth)

Para executar o app localmente (Node, Expo, dispositivo na mesma rede Wi‑Fi que o PC), veja a seção **Getting Started** do [README](../README.md).
