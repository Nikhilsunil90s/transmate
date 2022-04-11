#!/bin/bash
# Grab jq path for later and set execute permission
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
jq=$DIR/bin/jq
chmod +x $jq
# Source code is located in the 'bundle' directory - let's go there
cd bundle
# Create a basic package file - we just need the meteor-node-stubs package
cat <<-JSON > package.json
{
  "name": "bundle",
  "version": "1.0.0",
  "main": "main.js",
  "dependencies": {
    "meteor-node-stubs": "^0.2.11"
  },
  "scripts": {
    "start": "node main.js"
  }
}
JSON
# Push to Bluemix but don't start just yet...
cf push "${CF_APP}" --no-start -b nodejs_buildpack -m 256M --no-manifest
# Bind the MongoDB service
# - MONGO_SERVICE environment variable is required
if [ -z "${MONGO_SERVICE}" ]; then
  echo "Set the MONGO_SERVICE environment variable to the name of the MongoDB service"
  exit 1
else
  cf bind-service "${CF_APP}" "${MONGO_SERVICE}"
fi
# Grab the application guid for later
GUID=`cf curl /v2/apps?q=name:${CF_APP} | $jq -r '.resources[0].metadata.guid'`
# Set the MongoDB URL
# - assumes the Bluemix provided "compose-for-mongodb" service is used
MONGO_URL=`cf curl /v2/apps/${GUID}/env | $jq -r '.system_env_json.VCAP_SERVICES["compose-for-mongodb"][0].credentials.uri'`
cf set-env "${CF_APP}" MONGO_URL "${MONGO_URL}"
# Set the Root URL
ROOT_URL=`cf curl /v2/apps/${GUID}/env | $jq -r '.application_env_json.VCAP_APPLICATION.uris[0]'`
ROOT_URL="https://$ROOT_URL"
cf set-env "${CF_APP}" ROOT_URL "${ROOT_URL}"
# Restage and start
cf restage "${CF_APP}"
cf start "${CF_APP}"