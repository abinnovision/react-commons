#!/bin/bash
# Shared utilities for setup scripts.

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { printf "${GREEN}✓${NC} %s\n" "$1"; }
skip() { printf "${YELLOW}⏭${NC} %s\n" "$1"; }
fail() { printf "${RED}✗${NC} %s\n" "$1"; }
info() { printf "\n==> %s\n" "$1"; }
