#!/bin/bash

# tag is next|latest|master|x.x.x
# https://www.chartjs.org/dist/$tag/
# https://www.chartjs.org/docs/$tag/
# https://www.chartjs.org/samples/$tag/
function tag_from_version {
    local version=$1
    local mode=$2
    local tag=''
    if [ "$version" == "master" ]; then
        tag=master
    elif [[ "$version" =~ ^[^-]+$ ]]; then
      if [[ "$mode" == "release" ]]; then
        tag=$version
      else
        tag=latest
      fi
    else
        tag=next
    fi
    echo $tag
}
