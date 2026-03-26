# lab

GitHub Pages で公開する静的ツール集のリポジトリ。
`rpgsave-editor` リポジトリをベースにスキャフォールドした Vue + PrimeVue + Tailwind 構成。

ブランチはmainに直接コミットすること。

---

## このリポジトリの役割

- `https://imo-tikuwa.github.io/lab/` をランディングページとして公開する
- 各ツールは `https://imo-tikuwa.github.io/lab/<tool-name>/` で公開する
- 各ツールはプライベートリポジトリをサブモジュールとして参照し、GitHub Actions でビルドして公開する

---

## 技術スタック

- Vue 3 + TypeScript（`<script setup lang="ts">`）
- PrimeVue（UIコンポーネント）
- Tailwind CSS
- Vite（ビルドツール）
- ESLint + Prettier（コードスタイル）

---

## コマンド

- `npm run dev`: 開発サーバー起動
- `npm run build`: プロダクションビルド
- `npm run lint`: ESLint 実行
- `npm run format`: Prettier 実行

---

## ランディングページの仕様

`https://imo-tikuwa.github.io/lab/` に表示するページ。

- ツール一覧を DataView で表示（list / grid 切り替え・公開日ソート対応）
- 各アイテムにツール名・概要・できること・技術スタック・公開日を表示

### 現在公開中のツール

| ツール名 | パス | 概要 |
|---|---|---|
| RPGツクール MV/MZ セーブエディター | `/lab/rpgsave-editor/` | RPGツクール MV / MZ のセーブデータ（.rpgsave / .rmmzsave）をブラウザ上で閲覧・編集するツール |
| 風来のシレン6 値段識別ツール | `/lab/shiren6-price-helper/` | 風来のシレン6 に登場するアイテムの値段から種類を識別するツール |
| プリンセスコネクト！Re:Dive 究極錬成自動化ツール | `/lab/pricone-re-synthesis/` | プリンセスコネクト Re:Dive の究極錬成を Windows 上で自動化するデスクトップツールの紹介ページ |

---

## コードスタイル

- TypeScript strict モード。`any` 型は禁止
- SFC は `<script setup lang="ts">` を使用すること
- named export を使用すること（default export 禁止）
- フォーマッターは Prettier を使用すること

---

## GitHub Pages 公開設定

### 前提

- `lab` は **パブリックリポジトリ**
- 各ツールのリポジトリは **プライベートリポジトリ**（サブモジュールとして参照）

### サブモジュールの登録

```bash
git submodule add https://github.com/<username>/rpgsave-editor.git pages/rpgsave-editor
git commit -m "add rpgsave-editor submodule"
```

### GitHub Secrets の設定

各リポジトリの Secrets は [`docs/secrets.md`](docs/secrets.md) を参照。

### GitHub Pages の設定

`lab` リポジトリの Settings → Pages で **Source を `GitHub Actions`** に設定する。

### GitHub Actions ワークフロー構成

```
各ツールリポジトリ: main push
  → 各ツール側ワークフロー: lab をチェックアウトしてサブモジュール参照を更新・プッシュ
    → deploy.yml: push をトリガーにビルド＆デプロイ
```

サブモジュール参照の更新は **各ツールリポジトリ側のワークフローが担う**。
各ツールリポジトリには `LAB_REPO_ACCESS_TOKEN`（lab への Contents: Write 権限を持つ PAT）を Secrets に登録し、`update-lab-submodule.yml` を追加する。

---

## 新しいツールを追加する手順

1. サブモジュールを追加する
   ```bash
   git submodule add https://github.com/<username>/<tool>.git pages/<tool>
   ```
2. 必要な Secrets を lab に登録する（`PRIVATE_REPO_TOKEN` の対象リポジトリ追加・GA4 ID 等）
3. `deploy.yml` にビルド・コピーステップを追加する
4. `src/App.vue` のツール一覧に新しいツールを追加する
5. 新ツールリポジトリに `update-lab-submodule.yml` を追加し、`LAB_REPO_ACCESS_TOKEN` を Secrets に登録する

---

## ローカル作業前の準備

lab のサブモジュール参照は通常、各ツール側のワークフローがリモートを自動更新する。
ローカルで作業する場合は必ず最初に以下を実行して、親リポジトリとサブモジュールを同時に最新化すること。

```bash
git pull --recurse-submodules
```

**`git submodule update --remote` は手動実行禁止。**
ワークフロー管理下のサブモジュール参照を飛び越えて不要な差分が生まれる原因になる。

---

## 備考

- `lab` のパブリックリポジトリには `.gitmodules` を通じてサブモジュールの URL（リポジトリ名）が公開される。コミットハッシュも参照可能。リポジトリの **中身** は非公開のまま。
- PAT の有効期限に注意。期限切れになるとワークフローが失敗するため、定期的に更新が必要。
