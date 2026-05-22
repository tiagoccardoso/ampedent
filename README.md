# DentalSys

![Página inicial](https://res.cloudinary.com/dkofkuquf/image/upload/v1707530071/nuxtshop/lqnlwdzylzf5u2zgu2bo.png)

DentalSys é um site completo para consultório odontológico criado com **Next.js**,
**Tailwind CSS**, **Supabase Postgres** e **Supabase Auth**. Ele conta com um sistema intuitivo de
agendamento de consultas e um painel administrativo seguro.

## Recursos

- **Agendamento de consultas:** usuários podem agendar consultas facilmente pelo
  sistema intuitivo de agendamento. Todos os agendamentos são armazenados no
  Supabase Postgres para facilitar o gerenciamento.
- **Painel administrativo:** gerencie consultas e outros conteúdos do site por
  meio de um painel administrativo seguro. Acesse `/admin` para entrar com suas
  credenciais administrativas.
- **Autenticação:** o site usa Supabase Auth com email e senha. O painel
  administrativo é acessível apenas para administradores. Um usuário pode se
  cadastrar em `/admin`, e um superadministrador pode criar outros usuários
  administradores comuns.

## Tecnologias utilizadas

- **Next.js**: framework React popular para criar aplicações web dinâmicas e de
  alta performance.
- **Tailwind CSS**: framework CSS utility-first para criar designs personalizados
  com rapidez.
- **Supabase Postgres**: banco de dados PostgreSQL hospedado usado para armazenar
  agendamentos e perfis administrativos.
- **Supabase Auth**: autenticação por email e senha para o painel
  administrativo.

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
- Adicione as variáveis de ambiente necessárias para Supabase.

  ```env
  # Supabase
  SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

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
`admin_users.auth_user_id` para habilitar o login administrativo por email e
senha.

## Versão online

[https://ampedent.atalek.com](https://ampedent.atalek.com)

## Autor

Github [@atalek](https://github.com/atalek) <br> Linkedin:
[@Aleksandar Atanasovski](https://www.linkedin.com/in/aleksandar-atanasovski-16b123263/)
<br> Portfólio: [https://www.atalek.com/](https://www.atalek.com/)
