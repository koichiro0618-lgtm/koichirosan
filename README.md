This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cloudflare への公開

- 本番は Cloudflare Workers（OpenNext）＋ D1 データベース `crossfit-ikebukuro-portal` で動きます。
- `main` または `claude/crossfit-portal-site-OhkMB` に push すると、GitHub Actions（`.github/workflows/deploy-cloudflare.yml`）が
  データベースの更新 → ビルド → 公開 を自動で行います。
- 必要な GitHub Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- テーブル定義を変えたときは `migrations/` に `0002_xxx.sql` のように SQL を追加し、`prisma/schema.prisma` も合わせて更新します。

ローカル確認:

```bash
npm run db:migrate:local   # ローカルD1にテーブル作成
npm run preview            # Cloudflareと同じ環境で起動
```
