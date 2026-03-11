.PHONY: preview serve build build-lab build-submodules build-rpgsave-editor build-shiren6-price-helper

SITE_DIR := /tmp/lab-site
SERVE_DIR := /tmp/lab-serve
PORT := 8080

# ビルドしてからプレビューサーバーを起動
preview: build serve

# lab + 全サブモジュールをビルドして site/ に集約
build: build-lab build-submodules

# lab のビルド（dist/ を site/ としてリネーム）
build-lab:
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

# 既存のビルド成果物をそのままプレビューサーバーで配信
serve:
	mkdir -p $(SERVE_DIR)
	ln -sfn $(SITE_DIR) $(SERVE_DIR)/lab
	npx --yes http-server $(SERVE_DIR) -p $(PORT) --cors
