echo "deploy $CF_APP_NAME"
# set by action
# export SENTRY_ORG=transmate
# export SENTRY_PROJECT=transmate-app
# export SENTRY_NO_PROGRESS_BAR=1
#setup sentry
curl -sL https://sentry.io/get-cli/ | bash

export RELEASE_NAME=`sentry-cli releases propose-version`
export DEPLOY_TS=$(date +%Y-%m-%d) 
echo "start deploy $CF_APP_NAME with release v $RELEASE_NAME"

sentry-cli releases new $RELEASE_NAME

start=$(date +%s)
# rm -rf .deploy/bundle
# meteor build ./.deploy --directory --server-only --architecture os.linux.x86_64 --allow-superuser
# = npm run build
cd ./.deploy
npm ci && npm run build-env-script #build env.js script
cd bundle
cp ../* . #add root folder files like env and package.json, not including folders into bundle
chmod -R 755 *
cd programs/server
npm install
cd ../.. # back to bundle
envsubst < manifest-app.yml > manifest-temp.yml
#cf target -s live && cf create-app-manifest $CF_APP_NAME -p manifest-temp.yml && cf push $CF_APP_NAME -f manifest-temp.yml  --strategy rolling && rm manifest-temp.yml 
cf target -s live && cf push $CF_APP_NAME -f manifest-temp.yml  --strategy rolling
rm manifest-temp.yml
now=$(date +%s)
sentry-cli releases deploys "$RELEASE_NAME" new -e "$CF_APP_NAME" -t $((now-start))

#sentry-cli --auth-token ${{ secrets.SENTRY_AUTH_TOKEN}}
ls
# still in bundle folder so we can use relative locations
sentry-cli releases files "$RELEASE_NAME" upload-sourcemaps ./programs/web.browser --ignore node_modules 
#sentry-cli releases files "$RELEASE_NAME" upload-sourcemaps /programs/web.browser.legacy --ignore node_modules
sentry-cli releases files "$RELEASE_NAME" upload-sourcemaps ./programs/server --ignore node_modules
sentry-cli releases finalize "$RELEASE_NAME"

         
          