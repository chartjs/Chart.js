#!/bin/bash

set -e

# Note: this code also exists in deploy.sh
# Make sure that this script is executed only for the release and master branches
VERSION_REGEX='[[:digit:]]+.[[:digit:]]+.[[:digit:]]+(-.*)?'
if [[ "$TRAVIS_BRANCH" =~ ^release.*$ ]]; then
    # Travis executes this script from the repository root, so at the same level than package.json
    VERSION=$(node -p -e "require('./package.json').version")
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    VERSION="master"
else
    echo "Skipping docs configuration because this is not the master or release branch"
    exit 0
fi

# Note: this code also exists in deploy.sh
# tag is next|latest|master
# https://www.chartjs.org/docs/$tag/
function update_config {
    local tag=''
    if [ "$VERSION" == "master" ]; then
        tag=master
    elif [[ "$VERSION" =~ ^[^-]+$ ]]; then
        tag=lastest
    else
        tag=next
    fi
    sed -i -e "s/VERSION/$tag/g" "docs/docusaurus.config.js"
}

update_config
