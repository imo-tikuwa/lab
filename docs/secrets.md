# GitHub Secrets / Variables 管理

各リポジトリに登録している Secrets と Variables の一覧。
新しいツールを追加した際はこのファイルを更新すること。

---

## lab（パブリックリポジトリ）

Settings → Secrets and variables → Actions

| 名前 | 種別 | 内容 |
|---|---|---|
| `PRIVATE_REPO_TOKEN` | Secret | fine-grained PAT。lab: Contents Write / 各ツールリポジトリ: Contents Read |
| `VITE_RPGSAVE_EDITOR_GA4_MEASUREMENT_ID` | Secret | rpgsave-editor の GA4 測定 ID |
| `VITE_SHIREN6_PRICE_HELPER_GA4_MEASUREMENT_ID` | Secret | shiren6-price-helper の GA4 測定 ID |
| `VITE_PRICONE_RE_SYNTHESIS_GA4_MEASUREMENT_ID` | Secret | pricone-re-synthesis の GA4 測定 ID |
| `GH_STATS_TOKEN` | Secret | fine-grained PAT。`scripts/fetch-github-stats.js` 実行用。未設定時は `GITHUB_TOKEN`（Actions 自動提供）にフォールバックし、公開リポジトリのみ取得。 |
| `VITE_WORKER_BASE_URL` | Variable | Cloudflare Worker のベース URL。`VITE_` プレフィックスにより Vite ビルド時に公開される |

---

## rpgsave-editor（プライベートリポジトリ）

Settings → Secrets and variables → Actions

| 名前 | 種別 | 内容 |
|---|---|---|
| `LAB_REPO_ACCESS_TOKEN` | Secret | `PRIVATE_REPO_TOKEN` と同一の fine-grained PAT |

---

## shiren6-price-helper（プライベートリポジトリ）

Settings → Secrets and variables → Actions

| 名前 | 種別 | 内容 |
|---|---|---|
| `LAB_REPO_ACCESS_TOKEN` | Secret | `PRIVATE_REPO_TOKEN` と同一の fine-grained PAT |

---

## pricone-re-synthesis（パブリックリポジトリ）

Settings → Secrets and variables → Actions

| 名前 | 種別 | 内容 |
|---|---|---|
| `LAB_REPO_ACCESS_TOKEN` | Secret | `PRIVATE_REPO_TOKEN` と同一の fine-grained PAT |

---

## lab-video（プライベートリポジトリ・サブモジュール）

`services/cloudflare` としてサブモジュール参照。他のツールリポジトリと異なり、lab-video 側からサブモジュール参照を自動更新するワークフローは設けていない。R2 へのファイルアップロードはローカルから `make upload-all` で手動実施。

`LAB_REPO_ACCESS_TOKEN` の設定・`update-lab-submodule.yml` の追加は不要。

---

## 新しいツールを追加するときのチェックリスト

- [ ] `PRIVATE_REPO_TOKEN`（PAT）の対象リポジトリに新ツールリポジトリの Contents: Read を追加
- [ ] lab の Secrets に `VITE_<TOOL>_GA4_MEASUREMENT_ID` 等、ツール固有の値を追加
- [ ] 新ツールリポジトリの Secrets に `LAB_REPO_ACCESS_TOKEN` を登録（PAT は共通）

---

## Cloudflare 認証情報

WSL2 側の配置先パスは `.devcontainer/devcontainer.json` 参照。

| 変数名 | 内容 |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID。R2 エンドポイント URL の構築と wrangler に使用 |
| `CLOUDFLARE_API_TOKEN` | lab-token の API トークン値。wrangler（R2 操作・Worker デプロイ）に使用 |
| `R2_ACCESS_KEY_ID` | lab-token の Access Key ID。S3 互換 API 経由の R2 アップロードに使用 |
| `R2_SECRET_ACCESS_KEY` | lab-token の Secret Access Key。S3 互換 API 経由の R2 アップロードに使用 |

**権限：** Workers R2 Storage Write / Workers R2 Data Catalog Write / Workers R2 SQL Read / Workers Scripts Write

---

## PAT（fine-grained Personal Access Token）

| 項目 | 値 |
|---|---|
| Token name | `lab-deploy` |
| Description | lab の GitHub Pages デプロイ用。lab への書き込みおよびプライベートなサブモジュールリポジトリの読み取りに使用。 |
| Expiration | No expiration |
| Repository access | Only select repositories（lab + 各ツールリポジトリ） |
| Permissions | Contents: Read and write、Metadata: Read-only（必須） |
