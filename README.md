## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


## Deployment (Vercel)

This project uses a custom Vercel build command that applies Prisma migrations and generates the client during build.

### 1) Database

npx prisma studio

npx prisma generate

npx prisma migrate dev --name init


### 2) Build command

`vercel.json` sets:
npm run vercel-build

Which runs:
npm run prisma:migrate:deploy && npm run prisma:generate && npm run build

### 3) Deploy

- Connect the repo in Vercel and deploy.
- Ensure Vercel can reach the database (RDS security group/VPC rules).

npx vercel --prod --yes


### 4) Health check

GET /api/health
