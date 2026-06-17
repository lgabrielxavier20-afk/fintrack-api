# FinTrack API

FinTrack e uma aplicacao de controle financeiro pessoal com API em Java/Spring Boot e interface web responsiva. O projeto permite cadastro, login com JWT, registro de transacoes e visualizacao de saldo, receitas, despesas e gastos recorrentes na tela inicial.

## Funcionalidades

- Cadastro e login de usuarios
- Autenticacao com JWT
- Criacao e listagem de transacoes financeiras
- Calculo de saldo por usuario
- Dashboard web responsiva com visual preto e dourado
- Area de gastos recorrentes no frontend

## Tecnologias

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT
- HTML, CSS e JavaScript
- Maven Wrapper

## Como Rodar

1. Crie um banco PostgreSQL chamado `fintrack`.
2. Configure as variaveis de ambiente, se quiser sobrescrever os valores locais:

```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/fintrack
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=sua-chave-jwt-com-pelo-menos-32-caracteres
JWT_EXPIRATION=86400000
SERVER_PORT=8080
```

3. Execute a aplicacao:

```bash
./mvnw spring-boot:run
```

No Windows:

```bash
mvnw.cmd spring-boot:run
```

4. Acesse:

```text
http://localhost:8080
```

## Endpoints

### Autenticacao

```http
POST /api/auth/register
POST /api/auth/login
```

Parametros:

- `name`
- `email`
- `password`

No login, envie apenas `email` e `password`.

### Transacoes

```http
GET /api/transactions?userId={id}
POST /api/transactions
GET /api/transactions/balance?userId={id}
```

Parametros para criar transacao:

- `description`
- `amount`
- `type` (`INCOME` ou `EXPENSE`)
- `userId`

## Interface

A interface web esta em `src/main/resources/static` e e servida pelo proprio Spring Boot. Ela consome os endpoints da API, salva o token JWT no navegador e apresenta uma dashboard responsiva.

## Status do Projeto

Projeto em desenvolvimento para estudos e portfolio. Proximos passos possiveis:

- Vincular transacoes ao usuario autenticado sem depender de `userId` na URL
- Persistir gastos recorrentes no backend
- Criar CRUD de categorias
- Adicionar testes para controllers e services
