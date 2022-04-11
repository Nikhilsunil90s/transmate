#!/bin/bash
set -e
source $WORKSPACE/.bluemix/toolchain/scripts/set_defaults.sh
source $WORKSPACE/.bluemix/toolchain/scripts/deploy.sh
source $WORKSPACE/.bluemix/toolchain/scripts/purge_cloudflare.sh
deploy
purge_cloudflare