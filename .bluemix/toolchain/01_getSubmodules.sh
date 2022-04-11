#!/bin/bash
set -e
source $WORKSPACE/.bluemix/toolchain/scripts/set_defaults.sh
# Configure Git.
status "get branch $GIT_BRANCH and get submodules"
#git clone -b $GIT_BRANCH --recurse-submodules https://github.com/ph-poppe/transmate-new
git submodule update --init --recursive
# Tell Git to forget about our credentials.
#git credential-cache exit