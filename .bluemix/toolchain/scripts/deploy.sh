# based on 
# https://gist.github.com/DMeechan/dc0cf5a5072d5ebd3eb34a21377694d2
# https://medium.com/@petertuton/how-to-build-and-deploy-a-meteor-application-on-ibm-bluemix-with-devops-services-974c0ba52529

installCF7(){
  status "installing cf7"
    #bin exist already
    cd $WORKSPACE/bin
    curl -L "https://packages.cloudfoundry.org/stable?release=linux64-binary&version=v7&source=github" | tar -zx
    chmod +x cf
    export PATH=$WORKSPACE/bin/:$PATH
    cf version
    #cf7 version
    cd $WORKSPACE

  status "login CF"
    #re-logon
    cf login -a $CF_TARGET_URL -u apikey -p $PIPELINE_BLUEMIX_API_KEY -o $CF_ORG -s $CF_SPACE 
}

installCF7

deploy(){
    # Source code is located in the 'bundle' directory 
    cd $WORKSPACE
    # Create a basic package file 
   
    FILE=$WORKSPACE/bundle/main.js
    if test -f "$FILE"; then
        echo "$FILE exists, lets add package."
    else
        echo "ERROR: $FILE does not exists, lets exit."
        exit 0 
    fi


    status "deploy without downtime CF_APP: " + ${CF_APP}
    # add blue green

    #take manifest from running website
    cf create-app-manifest ${CF_APP} -p manifest-${CF_APP}.yml 
    ls
    # show folder size
    du -hs $WORKSPACE/bundle
    # cf blue-green-deploy ${CF_APP} -f manifest-${CF_APP}.yml --delete-old-apps
    # -t timeout in seconds
    # -k disk size (-k 1200M)
    cf push ${CF_APP} -k 1200M -f manifest-${CF_APP}.yml  --strategy rolling
    rm --force $WORKSPACE/manifest-${CF_APP}.yml
}
