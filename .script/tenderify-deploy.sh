rm -rf .deploy/bundle
meteor build ./.deploy --directory --server-only --architecture os.linux.x86_64 --allow-superuser
cd .deploy/bundle
chmod -R 755 *
cd programs/server
npm install
cd ../..
cat <<-JSON > package.json
{
"name": "bundle",
"version": "1.0.0",
"main": "main.js",
"engines": {
    "node": "14",
    "npm":"7"
},
"scripts": {
    "start": "node main.js"
}
}
JSON
cf target -s live && cf create-app-manifest meteor-tenderify -p manifest-temp.yml && cf push meteor-tenderify -f manifest-temp.yml  --strategy rolling && rm manifest-temp.yml 