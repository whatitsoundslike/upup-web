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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment (Vercel)

This project uses a custom Vercel build command that applies Prisma migrations and generates the client during build.

### 1) Environment variables

Add the following to your Vercel project's **Environment Variables**:

- `DATABASE_URL`

Example:
mysql://USER:PASSWORD@HOST:3306/DBNAME?sslaccept=accept_invalid_certs

If you want strict SSL, use:
mysql://USER:PASSWORD@HOST:3306/DBNAME?sslaccept=strict&sslcert=PATH

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
