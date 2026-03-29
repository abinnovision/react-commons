.PHONY: install install-immutable check-deps setup-dev

# Local development installation
install:
	yarn install

# CI installation with lockfile validation
install-immutable:
	yarn install --immutable

check-deps:
	@./tools/check-deps.sh

setup-dev: check-deps install
	@printf "\033[0;32m✓ Dev environment setup complete\033[0m\n"
