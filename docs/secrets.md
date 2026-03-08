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

## 新しいツールを追加するときのチェックリスト

- [ ] `PRIVATE_REPO_TOKEN`（PAT）の対象リポジトリに新ツールリポジトリの Contents: Read を追加
- [ ] lab の Secrets に `VITE_<TOOL>_GA4_MEASUREMENT_ID` 等、ツール固有の値を追加
- [ ] 新ツールリポジトリの Secrets に `LAB_REPO_ACCESS_TOKEN` を登録（PAT は共通）

---

## PAT（fine-grained Personal Access Token）

| 項目 | 値 |
|---|---|
| Token name | `lab-deploy` |
| Description | lab の GitHub Pages デプロイ用。lab への書き込みおよびプライベートなサブモジュールリポジトリの読み取りに使用。 |
| Expiration | No expiration |
| Repository access | Only select repositories（lab + 各ツールリポジトリ） |
| Permissions | Contents: Read and write、Metadata: Read-only（必須） |
