#!/bin/bash
set -e
source $WORKSPACE/.bluemix/toolchain/scripts/set_defaults.sh
source $WORKSPACE/.bluemix/toolchain/scripts/install_meteor.sh
source $WORKSPACE/.bluemix/toolchain/scripts/build.sh
source $WORKSPACE/.bluemix/toolchain/scripts/test.sh

install_meteor
build
