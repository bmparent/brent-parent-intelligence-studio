#!/usr/bin/env bash
set -euo pipefail

# GitHub images can route APT through mirror+file rather than a direct URL.
# Change only the slow Azure endpoint; keep suites, priorities, security
# fallback, package signatures and every browser dependency unchanged.
for source in /etc/apt/sources.list /etc/apt/apt-mirrors.txt /etc/apt/sources.list.d/ubuntu.sources; do
  if [[ -f "$source" ]]; then
    sudo sed -i -E 's#https?://azure\.archive\.ubuntu\.com/ubuntu#https://archive.ubuntu.com/ubuntu#g' "$source"
  fi
done
