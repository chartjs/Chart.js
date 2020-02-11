#!/bin/bash

set -e

if [[ ! "$TRAVIS_BRANCH" =~ ^release.*$ ]]; then
    echo "Skipping release because this is not the 'release' branch"
    exit 0
fi

# Travis executes this script from the repository root, so at the same level than package.json
VERSION=$(node -p -e "require('./package.json').version")

# Make sure that the associated tag doesn't already exist
GITTAG=$(git ls-remote origin refs/tags/v$VERSION)
if [ "$GITTAG" != "" ]; then
    echo "Tag for package.json version already exists, aborting release"
    exit 1
fi

git remote add auth-origin https://$GITHUB_AUTH_TOKEN@github.com/$TRAVIS_REPO_SLUG.git
git config --global user.email "$GITHUB_AUTH_EMAIL"
git config --global user.name "Chart.js"
git checkout --detach --quiet
git add -f dist/*.css dist/*.js bower.json
git commit -m "Release $VERSION"
git tag -a "v$VERSION" -m "Version $VERSION"
git push -q auth-origin refs/tags/v$VERSION 2>/dev/null
git remote rm auth-origin
git checkout -f @{-1}
