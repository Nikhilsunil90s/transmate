build() {
  (
    status "Set npm secret"
    echo "//npm.pkg.github.com/:_authToken=\"${GITHUB_READ_TOKEN}\"" >> $WORKSPACE/.npmrc
    #cat .npmrc
    status "Install Python"
    apt update
    apt-get -y install build-essential libssl-dev libffi-dev python-dev
    status "Install node-pre-gyp..."
    npm uninstall -g node-pre-gyp
    npm install @mapbox/node-pre-gyp -g
    status "Run meteor install..."
    meteor npm install
    status "install complete, remove token"
    rm --force $WORKSPACE/.npmrc
    status "Start Build"   
    meteor build $ARCHIVE_DIR --directory --server-only --architecture os.linux.x86_64 --allow-superuser
    status "set bundle chmod 755"
    chmod -R 755  $WORKSPACE/$ARCHIVE_DIR/bundle/
    status "copy bin (cf7 version)"
    mkdir $WORKSPACE/$ARCHIVE_DIR/bin
    cp $WORKSPACE/bin/* $WORKSPACE/$ARCHIVE_DIR/bin/
    status "copy ibm deploy scripts"
    mkdir $WORKSPACE/$ARCHIVE_DIR/.bluemix
    cp --recursive $WORKSPACE/.bluemix/* $WORKSPACE/$ARCHIVE_DIR/.bluemix/
    
  )
}
