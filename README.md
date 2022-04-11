[![CircleCI](https://circleci.com/gh/ph-poppe/transmate-new.svg?style=svg&circle-token=43b9abb257079ea21339081cfe7d367e8320580e)](https://circleci.com/gh/ph-poppe/transmate-new)
[![CodeFactor](https://www.codefactor.io/repository/github/ph-poppe/transmate-new/badge?s=325033582ecd52552b58850d4d81d77874b0897f)](https://www.codefactor.io/repository/github/ph-poppe/transmate-new)
![](https://github.com/ph-poppe/transmate-new/workflows/Mocha%20testing/badge.svg)

# Transmate

## Setup your project

After you clone your project:

```bash
cp settings-example.json settings.json
meteor npm install
```

Run it: (will setup a temp mongodb with fixtures)

```bash
meteor npm run start
```

## generating CSS files

We are using the npm library instead of the meteor library

goto private/semantic/semantic for more info

after set up: run 'semantic:build' to regenerate files

## generating translation files

goto private/translations for more info

after set up: run 'translations:build' to regenerate files

## using React components in Blaze

Currently most of the components are in Blaze, and we are incrementally
migrating everything to React.

For all migrations to React, we'll stick to the guide from https://guide.meteor.com/react.html#react-in-blaze

**NOTE**

- You should not use `ReactLayout.render` directly. This is not recommended
  according to the official Meteor docs.
- Always name your react files as `.jsx` to help distinguish them. It's very
  useful in total migration to React later

Follow these steps to add react components:

1. Assuming your react component is `MyReactComponent.jsx`, and you want to
   use with blaze, you need a Blaze template-wrapper.

Your typical Blaze wrapper (wrapperMyReactComponent.html) should look like this:

```
<template name="WrapperMyReactComponent">
  <div>{{> React component=MyReactComponent username=username}}</div>
</template>
```

2. In your layout file, you use:

```
Template.WrapperMyReactComponent.helpers({
  MyReactComponent() {
    return MyReactComponent;
  }
})
```

3. To pass props (let's say `username`) to the React component, we use this approach:

```
FlowRouter.route("/shipments", {
  name: "shipments",
  triggersEnter: mustBeLoggedIn,
  action() {
    BlazeLayout.render("AppLayout", {
      main: "WrapperMyReactComponent",
     *** username: "My Name" ***
    });
  }
});
```

## Using Modals in React

To use Modals in React to conform to the initial Blaze layouts,
just import out-of-box from `semantic-ui-react` library (no configs)

For instance
`import { Modal } from "semantic-ui-react";`

Refer to https://react.semantic-ui.com/modules/modal

## Deployment

<b>Deploy on bluemix:</b></br>
if not logged in :

"ibmcloud login " then "ibmcloud target --cf" to select correct account and space (account starts with 19\*)

meteor build ../deploy-buildpack/. --server-only --architecture os.linux.x86_64</br>
use these instructions : (modify node version, modify settings with DB uri)</br>
https://www.meshcloud.io/en/2018/02/14/deploying-meteor-apps-on-cloud-foundry/
</br>

<b>Deploy on Galaxy:</b></br>
DEPLOY_HOSTNAME=eu-west-1.galaxy.meteor.com meteor deploy app.transmate.eu --settings settings-prod.json</br>
</br>

<b>(test) build:</b></br>

git clone https://github.com/ph-poppe/transmate-new.git</br>
cd transmate-new</br>
tar xf packages.tar.xz</br>
meteor npm install</br>
meteor build ../testbuild --server-only --directory --architecture os.linux.x86_64</br>
cd build/bundle/programs/server/</br>
npm install</br>

<b>run:</b></br>
meteor --settings settings.json</br>

## testing


### developing with github access

make sure you are logged in into github packages, you might need to create a github personal access token (PAT) for this login:

`npm login --registry=https://npm.pkg.github.com`

You will need access to (ask us if you don't):

git (read&write)

- https://github.com/Transmate-EU/transmate-new
- https://github.com/Transmate-EU/transmateSchemas.git/

npm install (read)

- https://github.com/Transmate-EU/bigquery_module_transmate
- https://github.com/Transmate-EU/component_timezone
- https://github.com/Transmate-EU/transmate-calculations
- https://github.com/Transmate-EU/ibm-function-basis

install packages `meteor npm install`

first run
`npm run start`

this will setup a local mongo database (port 3001) with the fixtures loaded to be able to start, on each code modification this database will be reset!

you will need to give a correct ROOT_URL (ie `ROOT_URL='http://192.168.7.7:3000'` in your enviroment if you are not running tests locally!

after this you should be able to run meteor with (no need to reset the db each time) `meteor run --allow-incompatible-update --exclude-archs web.browser.legacy,web.cordova` with setting ROOT_URL / --port if needed.

use `METEOR_MONGO_BIND_IP=127.0.0.1,192.168.7.7` if you like to see the local db

make sure that these tests run after you make any modifications to the backend: 

`npm run test-pure-js`


you can login with :

- "carrier@transmate.eu" (carrier)
- "globex@transmate.eu" (shipper)

password is "TransmateDemo"

if you use the pre-installed package you might need to remove previous builds
`sudo rm -r .meteor/local/`

> You can log debugging output on both server and client:
>
> - on server: set env variable DEBUG="\*" (for everything) or DEBUG="< group >: < subgroup >"
> - on client: in console set localStorage.debug="\*" or for group / subgroup

### mocha testing

use npm run test or test_circleci

for ci: optionally use grep: export MOCHA_GREP=<>"

### coverage testing

- `npm run test:coverage:unit`, then open `.coverage/index.html` to see the report
- `npm run test:coverage:e2e`, then open `.coverage/lcov-report/index.html` to see the report
- `npm run test:coverage:watch`, then open <http://localhost:3050/coverage> to see the report
- `npx nyc report --reporter=text-summary` to see a report

Nyc configuration info: <https://github.com/istanbuljs/nyc>

Read more here: <https://forums.meteor.com/t/code-coverage-with-meteorjs-and-cypress/54941/2>

Also here: <https://docs.cypress.io/guides/tooling/code-coverage>

### cypress testing

run npm run `test:e2e` or `test:e2e:ci` to run cypress tests

for window forwarding in wsl:
modify cypress:open to: `export DISPLAY=<IP>:0.0 LIBGL_ALWAYS_INDIRECT=1 && cypress open`
with the ip == IPv4 Address of the host.

run xlaunch on host & then run the `test:e2e` with the modified environment variables

## functions

### pdf generation

HTML templates can be found in templates collection

```

{

    "name" : "stageConfirmation",
    "comment" : "template for DO&CO",
    "template" : "<html></html>",
    "accountId" : "S70325",
    "footerLine" : "line with company address/tax number..."
}

```

it will look for default templates and account specific templates (linked to `shipment.accountId`)
sorts so it will take the first found one (= the specific one if exists , default if not)

you can use sendgrid to test/format templates

use`class="noprint"` for showing text in email but not in pdf (= print)

use `<p style="page-break-before: always" >` to get a page break during printing

## Working in VS Code

- install the Apollo GraphQL extension with `Ctrl+P`:

  `ext install apollographql.vscode-apollo`

- start the dev server
  `npm run start-dev-local`

- generate a schema file(`graphql.schema.json`): `npm run graphql-codegen`. You should do this whenever the schema undergoes a change

- restart VS Code, it should now validate and autocomplete GraphQL

- if you have issues this extension might help
  `ext install MamoruDS.workspace-cacheclean` so you can refresh the workspace

## AG-Grid

We moved to the modules approach to reduce bundle size. more info here:

https://www.ag-grid.com/react-data-grid/modules/
