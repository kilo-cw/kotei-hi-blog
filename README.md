# 毎月ちょっと浮く。

固定費（ガス・スマホ・ネット・保険）の見直しブログ。Astro 5 + Cloudflare Workers。

## 開発
```
npm install
npm run dev     # http://localhost:4321（下書き記事も表示）
npm run build   # 本番ビルド（draft: true の記事は除外）
```

## 公開（Cloudflare Workers）
`main` に push すると Workers Builds が `npm run build` → `npx wrangler deploy` を実行し、`dist/` を配信する（`wrangler.jsonc`）。

## 運営者がやること
- A8.net で提携が承認されたら、広告リンクを `src/data/programs.ts` の `url` に貼る
- Claude が作った下書き（プルリクエスト）を確認し、問題なければ `draft: false` にしてマージ
