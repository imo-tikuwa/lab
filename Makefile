# ==============================================================================
# ローカル動作確認手順
# ==============================================================================
#
# [基本]
#   make preview       全体ビルド（lab + 全サブモジュール）してプレビュー起動
#   make preview-lab   lab のみ高速ビルドしてプレビュー起動（サブモジュールはビルド済み dist を流用）
#
# [アクセス]
#   http://localhost:5173/lab/
#
# [データ取得スクリプト（ビルド前に自動実行）]
#   node scripts/fetch-articles.js
#     → public/data/articles.json を生成（Qiita / Zenn 記事一覧）
#     → 認証不要。外部 API にアクセスできる環境なら誰でも実行可能
#
#   node scripts/fetch-github-stats.js
#     → public/data/github-stats.json を生成（GitHub コントリビューション統計）
#     → GH_STATS_TOKEN 環境変数が必要（未設定時はスキップ、草セクションが「準備中」表示になる）
#     → 初回のみ手動実行。以降の make preview では生成済み JSON が再利用される
#
#   GH_STATS_TOKEN の取得方法:
#     GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
#     スコープ: read:user（公開データのみ） または repo を追加（プライベートリポジトリ含む）
#
#   GH_STATS_TOKEN を使った手動実行（ヒストリに残さない方法）:
#     read -rsp "GH_STATS_TOKEN: " GH_STATS_TOKEN && echo && \
#       GH_STATS_TOKEN=$GH_STATS_TOKEN node scripts/fetch-github-stats.js
#
#
# [実機確認（スマホ）]
#   1. DevContainer で make preview-lab を起動しておく
#   2. WSL2 側で make proxy を実行する（UAC プロンプトが出る）
#   3. Ctrl+C で停止すると自動でプロキシも停止する（UAC プロンプトが出る）
#
#   前提: PC とスマホが同じ Wi-Fi に接続されていること。
#   アクセス URL: http://<PCのWiFi IP>:5173/lab/
#
# ==============================================================================

.PHONY: preview serve build build-lab build-submodules build-rpgsave-editor build-shiren6-price-helper preview-lab proxy

SITE_DIR := /tmp/lab-site
SERVE_DIR := /tmp/lab-serve
PORT := 5173

# ビルドしてからプレビューサーバーを起動
preview: build serve

# lab + 全サブモジュールをビルドして site/ に集約
build: build-lab build-submodules

# lab のビルド（dist/ を site/ としてリネーム）
build-lab:
	node scripts/fetch-articles.js
	node scripts/fetch-github-stats.js
	npm run build
	rm -rf $(SITE_DIR)
	mv dist $(SITE_DIR)

# 全サブモジュールをビルドして site/ にコピー
build-submodules: build-rpgsave-editor build-shiren6-price-helper

build-rpgsave-editor:
	cd pages/rpgsave-editor && npm ci && npm run build
	cp -r pages/rpgsave-editor/dist $(SITE_DIR)/rpgsave-editor

build-shiren6-price-helper:
	cd pages/shiren6-price-helper && npm ci && npm run build
	cp -r pages/shiren6-price-helper/dist $(SITE_DIR)/shiren6-price-helper

# 開発用高速プレビュー: lab のみビルド、サブモジュールはビルド済み dist を流用（なければスキップ）
preview-lab: build-lab
	@if [ -d "pages/rpgsave-editor/dist" ]; then \
		cp -r pages/rpgsave-editor/dist $(SITE_DIR)/rpgsave-editor; \
	else \
		echo "[preview-lab] rpgsave-editor/dist なし - スキップ"; \
	fi
	@if [ -d "pages/shiren6-price-helper/dist" ]; then \
		cp -r pages/shiren6-price-helper/dist $(SITE_DIR)/shiren6-price-helper; \
	else \
		echo "[preview-lab] shiren6-price-helper/dist なし - スキップ"; \
	fi
	$(MAKE) serve

# スマホ実機確認用: WSL2→Windows のポートプロキシを開始し、Ctrl+C で自動停止する
# ※ WSL2 側で実行すること。DevContainer で make preview-lab を起動済みであること。
proxy:
	-bash -c 'trap "bash scripts/proxy.sh stop" EXIT; bash scripts/proxy.sh start; echo ""; echo "プロキシ起動中 (port $(PORT))。Ctrl+C で停止します..."; sleep infinity'

# 既存のビルド成果物をそのままプレビューサーバーで配信
serve:
	mkdir -p $(SERVE_DIR)
	ln -sfn $(SITE_DIR) $(SERVE_DIR)/lab
	npx --yes http-server $(SERVE_DIR) -p $(PORT) --cors
