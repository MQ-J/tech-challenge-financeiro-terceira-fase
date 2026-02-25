# ✅ Lumen Financial - Mobile

Aplicação de gerenciamento financeiro utilizando React Native, com funcionalidades avançadas que foram ensinadas nas disciplinas do curso de pós-graduação em Front-End Engineering da Pos Tech.

## Desenvolvimento Expo app

Esse é um projeto [Expo](https://expo.dev) criado com [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

### Como executar o projeto

1. Instalar dependências

   ```bash
   npm install
   ```

2. Iniciar o app com o [Expo Go](https://expo.dev/go)

   ```bash
   npx expo start
   ```

### Características do projeto

- A versão mobile do Lumen Financial usa [file-based routing](https://docs.expo.dev/router/introduction).
- A configuração inicial foi feita seguindo o [Expo tutorial](https://docs.expo.dev/tutorial/introduction/).


## 📌 Proposta

* [ ] Desenvolver uma aplicação de gerenciamento financeiro, utilizando React Native ou Flutter Mobile, com funcionalidades avançadas que foram ensinadas nas disciplinas.
* [ ] A aplicação deve ser capaz de gerenciar transações financeiras, integrando recursos de navegação, segurança, autenticação e armazenamento em cloud.

---

## 📱 Requisitos do Desafio

### Tela Principal (Dashboard)

* [ ] Exibir gráficos e análises financeiras baseados nas transações do usuário.
* [ ] Implementar animações para transições entre seções do dashboard utilizando Animated (React Native) ou animações nativas do Flutter.

### Tela de Listagem de Transações

* [ ] Permitir ao usuário visualizar uma lista de transações com filtros avançados (por data, categoria, etc.).
* [ ] Implementar scroll infinito ou paginação para lidar com grandes volumes de dados.
* [ ] Integrar a busca com Cloud Firestore para buscar as transações do usuário autenticado.

### Tela de Adicionar/Editar Transação

* [ ] Permitir ao usuário adicionar novas transações e editar transações existentes.
* [ ] Validação Avançada de campos, como o valor e a categoria da transação.
* [ ] Upload de Recibos: Permitir o upload de recibos ou documentos relacionados à transação, salvando-os no Firebase Storage.

---

## 🛠 Tecnologias e Conceitos Utilizados

### React Native

* [ ] React Native para criar a aplicação, aplicando boas práticas de otimização de performance e usabilidade.
* [ ] Usar Expo para acelerar a configuração inicial do projeto e facilitar o desenvolvimento, especialmente para lidar com recursos como navegação, acesso a APIs nativas e integração com o Firebase.

### Gerenciamento de Estado

* [ ] Utilizar a Context API para gerenciar o estado global da aplicação, incluindo o estado de autenticação e transações.

---

## 📦 Entrega

### Código Fonte

* [ ] O código-fonte deve estar disponível em um repositório Git, com um README contendo as instruções necessárias para rodar a aplicação localmente.
* [ ] O README deve incluir a configuração do Firebase, dependências necessárias e passos para executar o projeto.

### Vídeo Demonstrativo

* [ ] Um vídeo de até 5 (cinco) minutos mostrando as principais funcionalidades da aplicação, incluindo:
* [ ] Login e autenticação.
* [ ] Adicionar/Editar transações.
* [ ] Visualizar e filtrar transações.
* [ ] Upload de anexos.
* [ ] Integração com Firebase.