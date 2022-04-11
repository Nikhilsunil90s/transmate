#! /bin/bash
npm install --global release-it
export GITHUB_TOKEN=${GITHUB_READ_TOKEN}
tagtest(){
    git clone -b develop https://github.com/ph-poppe/transmate-new
    cd transmate-new
    release-it "patch" --ci --no-npm.publish
    
}
taglive(){
    git clone -b develop https://github.com/ph-poppe/transmate-new
    cd transmate-new
    release-it "minor" --ci --no-npm.publish
}