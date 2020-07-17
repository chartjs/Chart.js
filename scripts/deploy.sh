#!/bin/bash

set -e

TARGET_DIR='gh-pages'
TARGET_BRANCH='master'
TARGET_REPO_URL="https://$GITHUB_AUTH_TOKEN@github.com/chartjs/chartjs.github.io.git"

# Note: this code also exists in docs-config.sh
# Make sure that this script is executed only for the release and master branches
VERSION_REGEX='[[:digit:]]+.[[:digit:]]+.[[:digit:]]+(-.*)?'
if [[ "$TRAVIS_BRANCH" =~ ^release.*$ ]]; then
    # Travis executes this script from the repository root, so at the same level than package.json
    VERSION=$(node -p -e "require('./package.json').version")
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    VERSION="master"
else
    echo "Skipping deploy because this is not the master or release branch"
    exit 0
fi

function move_sample_scripts {
    local subdirectory=$1
    for f in $(find ./samples/$subdirectory -name '*.html'); do
       sed -i -E "s/((\.\.\/)+dist\/)/..\/\1$subdirectory\//" $f
    done
}

function update_with_tag {
    local tag=$1
    rm -rf "docs/$tag"
    cp -r ../dist/docs docs/$tag
    rm -rf "samples/$tag"
    cp -r ../samples samples/$tag

    move_sample_scripts $tag

    deploy_versioned_files $tag
}

# Note: this code also exists in docs-config.sh
# tag is next|latest|master
# https://www.chartjs.org/docs/$tag/
# https://www.chartjs.org/samples/$tag/
# https://www.chartjs.org/dist/$tag/chart.*js
function update_tagged_files {
    if [ "$VERSION" == "master" ]; then
        update_with_tag master
    elif [[ "$VERSION" =~ ^[^-]+$ ]]; then
        update_with_tag lastest
    else
        update_with_tag next
    fi
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

# Copy distribution files
deploy_versioned_files $VERSION

update_tagged_files

git add --all

git remote add auth-origin $TARGET_REPO_URL
git config --global user.email "$GITHUB_AUTH_EMAIL"
git config --global user.name "Chart.js"
git commit -m "Deploy $VERSION from $TRAVIS_REPO_SLUG" -m "Commit: $TRAVIS_COMMIT"
git push -q auth-origin $TARGET_BRANCH
git remote rm auth-origin

# Cleanup
cd ..
rm -rf $TARGET_DIR
