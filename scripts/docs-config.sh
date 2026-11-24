#!/bin/bash

set -e

source ./scripts/utils.sh

VERSION=$1
MODE=$2

TAG=$(tag_from_version "$VERSION" "$MODE")

sed -i -e "s/VERSION/$TAG/g" "docs/.vuepress/config.ts"
# version is the tag the docs are published under; number is the release the
# version menu names, which a latest or next build cannot tell from its tag.
if [ "$TAG" == "master" ]; then
  printf '{\n  "version": "%s"\n}\n' "$TAG" > docs/.vitepress/docs-version.json
else
  printf '{\n  "version": "%s",\n  "number": "%s"\n}\n' "$TAG" "$VERSION" > docs/.vitepress/docs-version.json
fi
