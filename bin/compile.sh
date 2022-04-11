#!/bin/bash
METEOR_HOME=.meteor/local
PATH=$METEOR_HOME/usr/bin:$METEOR_HOME/usr/lib/meteor/bin:$PATH

indent() {
  c='s/^/       /'
  case $(uname) in
    Darwin) sed -l "$c";; # mac/bsd sed: -l buffers on line boundaries
    *)      sed -u "$c";; # unix/gnu sed: -u unbuffered (arbitrary) chunks of data
  esac
}
status() {
  echo "-----> $*"
}
install_meteor() {
  status "Installing Meteor (ignore any warnings about launcher scripts)"
  export PATH=/usr/bin:$PATH # necessary for install script to run from URL
  curl https://install.meteor.com | sh
status "Updating PATH with Meteor"
  PATH=$HOME/.meteor:$PATH
}
build() {
  (
    # git clone https://github.com/ph-poppe/transmate-new.git
    # cd transmate-new

    status "unzip archive modified packages"
    tar xf packages.tar.xz
    status "show dir structure"
    ls
    status "Building meteor bundle"
    meteor npm install
    #try twice (to solve less issue)
    {
      meteor build build --directory --server-only --architecture os.linux.x86_64
    } ||  
    {
      status "second build attempt" && sleep 15s && meteor build build --directory --server-only --architecture os.linux.x86_64
    }
    npm prune --production
    status "Installing dependencies"
    cd build/bundle/programs/server/
    npm install
    cd ../../
    chmod -R +w+x *
    mkdir $WORKSPACE/build/bin
    cp $WORKSPACE/bin/* $WORKSPACE/build/bin/
    status "Build complete"
  )
}
install_meteor
build