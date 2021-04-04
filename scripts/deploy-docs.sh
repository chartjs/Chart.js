#!/bin/bash

set -e

source ./scripts/utils.sh

TARGET_DIR='gh-pages'
TARGET_BRANCH='master'
TARGET_REPO_URL="https://$GITHUB_TOKEN@github.com/chartjs/chartjs.github.io.git"

VERSION=$1
MODE=$2
TAG=$(tag_from_version "$VERSION" "$MODE")

function move_sample_redirect {
    local tag=$1

    cp ../scripts/sample-redirect-template.html samples/$tag/index.html
    sed -i -E "s/TAG/$tag/g" samples/$tag/index.html
}

function deploy_tagged_files {
    local tag=$1
    rm -rf "docs/$tag"
    cp -r ../dist/docs docs/$tag
    rm -rf "samples/$tag"
    mkdir "samples/$tag"

    move_sample_redirect $tag

    deploy_versioned_files $tag
}

function deploy_versioned_files {
    local version=$1
    local in_files='../dist/chart*.js'
    local out_path='./dist'
    rm -rf $out_path/$version
    mkdir -p $out_path/$version
    cp -r $in_files $out_path/$version
}

# Clone the repository and checkout the gh-pages branch
git clone $TARGET_REPO_URL $TARGET_DIR
cd $TARGET_DIR
git checkout $TARGET_BRANCH

# https://www.chartjs.org/dist/$VERSION
if [["$VERSION" != "$TAG"]]; then
  deploy_versioned_files $VERSION
fi

# https://www.chartjs.org/dist/$TAG
# https://www.chartjs.org/docs/$TAG
# https://www.chartjs.org/samples/$TAG
deploy_tagged_files $TAG

git add --all

git remote add auth-origin $TARGET_REPO_URL
git config --global user.email "$GH_AUTH_EMAIL"
git config --global user.name "Chart.js"
git commit -m "Deploy $VERSION from $GITHUB_REPOSITORY" -m "Commit: $GITHUB_SHA"
git push -q auth-origin $TARGET_BRANCH
git remote rm auth-origin

# Cleanup
cd ..
rm -rf $TARGET_DIR
