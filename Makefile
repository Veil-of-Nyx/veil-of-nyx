# Define variables
WEB_EXT=node_modules/.bin/web-ext
SOURCE_DIR=.	
ARTIFACTS_DIR=./web-ext-artifacts
CHROMIUM_BINARY=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
FIREFOX_BINARY=/Applications/Firefox.app/Contents/MacOS/firefox

# Install dependencies
install: ## Install dependencies
	@npm install web-ext

# Run the extension in Firefox
run/firefox: install ## Run the extension in Firefox
	@$(WEB_EXT) run --firefox=$(FIREFOX_BINARY) --source-dir=$(SOURCE_DIR) --verbose

# Run the extension in Chrome
run/chrome: install ## Run the extension in Chrome
	@$(WEB_EXT) run --chromium-binary=$(CHROMIUM_BINARY) --source-dir=$(SOURCE_DIR) --verbose

# Build the extension package
build: install ## Build the extension package
	@$(WEB_EXT) build --source-dir=$(SOURCE_DIR) --artifacts-dir=$(ARTIFACTS_DIR) --verbose

# Lint the extension code
lint: ## Lint the extension code
	@npm run lint

# Clean the build artifacts
clean: ## Clean the build artifacts
	@rm -rf $(ARTIFACTS_DIR)

# Help target to list all available commands
help: ## Show this help
	@echo "\nAvailable commands:\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf " \033[0;36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Phony targets
.PHONY: install run/firefox run/chrome build lint clean help

# Default target
.DEFAULT_GOAL := help
