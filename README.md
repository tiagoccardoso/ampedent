# Ampedent

![Página inicial](https://res.cloudinary.com/dkofkuquf/image/upload/v1707530071/nuxtshop/lqnlwdzylzf5u2zgu2bo.png)

Ampedent é um site completo para consultório odontológico criado com **Next.js**,
**Tailwind CSS**, **Supabase/Neon Postgres REST** e sessão administrativa própria baseada em cookie assinado. Ele conta com um sistema intuitivo de
agendamento de consultas e um painel administrativo seguro.

## Recursos

- **Agendamento de consultas:** usuários podem agendar consultas facilmente pelo
  sistema intuitivo de agendamento. Todos os agendamentos são armazenados no
  Supabase Postgres para facilitar o gerenciamento.
- **Painel administrativo:** gerencie consultas e outros conteúdos do site por
  meio de um painel administrativo seguro. Acesse `/admin` para entrar com suas
  credenciais administrativas.
- **Autenticação:** o painel administrativo usa autenticação própria por email/senha contra a tabela `admin_users` e sessão assinada em cookie HTTP-only.

## Tecnologias utilizadas

- **Next.js**: framework React popular para criar aplicações web dinâmicas e de
  alta performance.
- **Tailwind CSS**: framework CSS utility-first para criar designs personalizados
  com rapidez.
- **Supabase Postgres**: banco de dados PostgreSQL hospedado usado para armazenar
  agendamentos e perfis administrativos.

![Painel administrativo](https://res.cloudinary.com/dkofkuquf/image/upload/v1707585171/nuxtshop/go7j387zbdkslzrayolk.png)

## Configuração

1. **Clone o repositório.**

   ```bash
   git clone https://github.com/atalek/ampedent.git
   ```

2. **Acesse o diretório do projeto.**

   ```bash
   cd ampedent
   ```

3. **Instale as dependências.**

   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente.**

- Crie um arquivo `.env` na raiz do projeto.
- Adicione as variáveis de ambiente necessárias para acesso ao Postgres via API e autenticação local por sessão.

  ```env
  # Obrigatórias em produção e desenvolvimento
  # Endpoint REST usado pela camada de dados (ex.: https://<project>.supabase.co)
  DATABASE_URL=your_project_rest_base_url
  # Chave server-side com permissão de leitura/escrita nas tabelas usadas pelo painel
  NEON_AUTH_SERVICE_ROLE_KEY=your_service_role_key
  # Segredo usado para assinar o cookie de sessão administrativa
  NEON_AUTH_COOKIE_SECRET=uma_chave_aleatoria_longa_para_assinar_sessao
  # URL pública da aplicação para callbacks/sessão
  NEXTAUTH_URL=http://localhost:3000
  # Compatibilidade com bibliotecas que ainda leem NEXTAUTH_SECRET
  NEXTAUTH_SECRET=uma_chave_aleatoria_longa_para_assinar_sessao

  # Compatibilidade com nomenclatura antiga (opcional)
  NEON_AUTH_BASE_URL=your_project_rest_base_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  AUTH_SECRET=uma_chave_aleatoria_longa_para_assinar_sessao

  NODE_ENV='development'
  ```

5. **Execute os SQLs em `supabase/migrations/` no seu projeto Supabase e, em
   seguida, crie um superusuário (ajuste nome, email e senha como preferir)
   com o script fornecido.**

   ```bash
   node createuser.js
   ```

6. **Inicie o servidor de desenvolvimento.**

   ```bash
   npm run dev
   ```

7. **Abra o navegador e acesse http://localhost:3000 para visualizar o site.**

## Migração de dados existentes do MongoDB para o Supabase

Se você já tiver dados no MongoDB, mantenha `MONGODB_URI` disponível apenas
durante a migração e execute:

```bash
npm run migrate:mongo-to-supabase
```

A migração copia os valores `_id` do Mongo para as colunas `mongo_id` e
normaliza os status dos agendamentos para `pending`, `completed` ou `canceled`.
Depois da migração, crie usuários correspondentes no Supabase Auth e preencha
`admin_users.password_hash` para habilitar o login administrativo por email e senha.

## Versão online

[https://ampedent.atalek.com](https://ampedent.atalek.com)

## Autor

Github [@atalek](https://github.com/atalek) <br> Linkedin:
[@Aleksandar Atanasovski](https://www.linkedin.com/in/aleksandar-atanasovski-16b123263/)
<br> Portfólio: [https://www.atalek.com/](https://www.atalek.com/)
