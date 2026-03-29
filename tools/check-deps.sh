#!/bin/bash
set -e
cd "$(dirname "$0")/.."
source ./tools/shared.sh

info "Checking dependencies..."

missing=0
for tool in node yarn; do
	if command -v "$tool" > /dev/null 2>&1; then
		ok "$tool found"
	else
		fail "$tool not found, install with: brew install $tool"
		missing=1
	fi
done

if [ $missing -eq 1 ]; then exit 1; fi
