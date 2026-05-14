# Ampedent

![Landing page](https://res.cloudinary.com/dkofkuquf/image/upload/v1707530071/nuxtshop/lqnlwdzylzf5u2zgu2bo.png)

Ampedent is a full-featured dental office website built with **Next.js**,
**Tailwind CSS**, and **Supabase Postgres**. It boasts an intuitive
appointment booking system, and a secure admin panel.

## Features

- **Appointment Booking:** Users can easily book an appointment using our
  intuitive booking system. All bookings are stored in Supabase Postgres for easy
  management.
- **Admin Panel:** Manage appointments and other site content through a secure
  admin panel.Navigate to /admin to login with your admin credentials.
- **Authentication:** The site uses NextAuth for authentication. The admin panel
  is accessible only to admins. A super admin can create other regular admin
  users.

## Technologies Used

- **Next.js**: A popular React framework for building dynamic and performant web
  applications.
- **Tailwind CSS**:A utility-first CSS framework for crafting tailored designs
  with rapid efficiency.
- **Supabase Postgres**: A hosted PostgreSQL database used to store bookings and
  admin users.
- **NextAuth**: A complete open source authentication solution for Next.js
  applications.

![Admin panel](https://res.cloudinary.com/dkofkuquf/image/upload/v1707585171/nuxtshop/go7j387zbdkslzrayolk.png)

## Setup

1. **Clone the repository.**

   ```bash
   git clone https://github.com/atalek/ampedent.git

   ```

2. **Navigate to the project directory.**

   ```bash
   cd ampedent

   ```

3. **Install dependencies.**

   ```bash
   npm install

   ```

4. **Configure environment variables.**

- Create a `.env` file in the root of the project.
- Add the necessary environment variables for Supabase and NextAuth.

  ```env
  # Supabase
  SUPABASE_URL=your_supabase_project_url
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

  # NextAuth
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your_nextauth_secret

  NODE_ENV='development'
  ```

5. **Run the SQL in `supabase/migrations/001_init_ampedent.sql` in your Supabase
   project, then create a superuser (modify the name and password to your liking)
   with the provided script.**

   ```bash
   node createuser.js

   ```

6. **Run the development server.**

   ```bash
   npm run dev

   ```

7. **Open your browser and visit http://localhost:3000 to view the website.**


## Migrating existing MongoDB data to Supabase

If you already have MongoDB data, keep `MONGODB_URI` available only while running
the migration and execute:

```bash
npm run migrate:mongo-to-supabase
```

The migration copies Mongo `_id` values into `mongo_id` columns, keeps existing
bcrypt password hashes, and normalizes booking status values to `pending`,
`completed`, or `canceled`.

## Live Version

[https://ampedent.atalek.com](https://ampedent.atalek.com)

## Author

Github [@atalek](https://github.com/atalek) <br> Linkedin:
[@Aleksandar Atanasovski](https://www.linkedin.com/in/aleksandar-atanasovski-16b123263/)
<br> Portfolio: [https://www.atalek.com/](https://www.atalek.com/)
