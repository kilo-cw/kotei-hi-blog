# 毎月ちょっと浮く。

固定費（ガス・スマホ・ネット・保険）の見直しブログ。Astro 5 + Cloudflare Pages。

## 開発
```
npm install
npm run dev     # http://localhost:4321（下書き記事も表示）
npm run build   # 本番ビルド（draft: true の記事は除外）
```

## Cloudflare Pages の設定
- フレームワーク プリセット: Astro
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`

## 運営者がやること
- A8.net で提携が承認されたら、広告リンクを `src/data/programs.ts` の `url` に貼る
- Claude が作った下書き（プルリクエスト）を確認し、問題なければ `draft: false` にしてマージ
