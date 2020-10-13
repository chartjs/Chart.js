#!/bin/bash

set -e

VERSION=$1

# Note: this code also exists in deploy.sh
# tag is next|latest|master
# https://www.chartjs.org/docs/$tag/
function update_config {
    local tag=''
    if [ "$VERSION" == "master" ]; then
        tag=master
    elif [[ "$VERSION" =~ ^[^-]+$ ]]; then
        tag=latest
    else
        tag=next
    fi
    sed -i -e "s/VERSION/$tag/g" "docs/docusaurus.config.js"
}

update_config
