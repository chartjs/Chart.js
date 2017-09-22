#!/bin/bash

set -e

TARGET_DIR='gh-pages'
TARGET_BRANCH='master'
TARGET_REPO_URL="https://$GITHUB_AUTH_TOKEN@github.com/chartjs/chartjs.github.io.git"
VERSION_REGEX='[[:digit:]]+.[[:digit:]]+.[[:digit:]]+(-.*)?'

# Make sure that this script is executed only for the release and master branches
if [ "$TRAVIS_BRANCH" == "release" ]; then
    # Travis executes this script from the repository root, so at the same level than package.json
    VERSION=$(node -p -e "require('./package.json').version")
elif [ "$TRAVIS_BRANCH" == "master" ]; then
    VERSION="master"
else
    echo "Skipping deploy because this is not the master or release branch"
    exit 0
fi

function update_latest {
    local out_path=$1
    local latest=($(ls -v $out_path | egrep '^('$VERSION_REGEX')$' | tail -1))
    if [ "$latest" == "" ]; then latest='master'; fi
    rm -f $out_path/latest
    ln -s $latest $out_path/latest
}

function deploy_files {
    local in_files=$1
    local out_path=$2
    rm -rf $out_path/$VERSION
    mkdir -p $out_path/$VERSION
    cp -r $in_files $out_path/$VERSION
    update_latest $out_path
}

# Clone the repository and checkout the gh-pages branch
git clone $TARGET_REPO_URL $TARGET_DIR
cd $TARGET_DIR
git checkout $TARGET_BRANCH

# Copy dist files
deploy_files '../dist/*.js' './dist'

# Copy generated documentation
deploy_files '../dist/docs/*' './docs'

# Copy samples ...
deploy_files '../samples/*' './samples'

# ... and relocate samples Chart/js scripts
for f in $(find ./samples/$VERSION -name '*.html'); do
   sed -i -E "s/((\.\.\/)+dist\/)/..\/\1$VERSION\//" $f
done

git add -A

git remote add auth-origin $TARGET_REPO_URL
git config --global user.email "$GITHUB_AUTH_EMAIL"
git config --global user.name "Chart.js"
git commit -m "Deploy $VERSION from $TRAVIS_REPO_SLUG" -m "Commit: $TRAVIS_COMMIT"
git push -q auth-origin $TARGET_BRANCH
git remote rm auth-origin

# Cleanup
cd ..
rm -rf $TARGET_DIR
