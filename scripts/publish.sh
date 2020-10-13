#!/bin/bash

set -e

NPM_TAG="next"

if [[ "$GITHUB_REF" =~ ^[^-]+$ ]]; then
    echo "Release tag indicates a full release. Releasing as \"latest\"."
    NPM_TAG="latest"
fi

npm publish --tag "$NPM_TAG"
