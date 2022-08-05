#!/bin/bash

set -e

source ./scripts/utils.sh

VERSION=$1
MODE=$2

TAG=$(tag_from_version "$VERSION" "$MODE")

sed -i -e "s/VERSION/$TAG/g" "docs/.vuepress/config.ts"
