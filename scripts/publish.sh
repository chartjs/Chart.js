#!/bin/bash

set -e

NPM_TAG="latest"

if [[ ! "$GITHUB_REF" =~ ^v\d+\.\d+\.\d+$ ]]; then
    echo "Release tag indicates a pre-release. Releasing as \"next\"."
    NPM_TAG="next"
fi

npm publish --tag "$NPM_TAG"
