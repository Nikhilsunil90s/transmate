
test(){
   status "setup for tests, add settings file"
   printenv METEOR_SETTINGS > settings.json
   status "start tests"
  # npm run test_circleci
  #  npm run ibm-test
# test report will match : unit_*.xml
# SERVER_TEST_REPORTER=xunit should deliver an xml report, but it seems incomplete.
   export MOCHA_TIMEOUT=10000  RESET_DATABASE=TRUE   && meteor  test --allow-superuser  --driver-package meteortesting:mocha --once --settings settings.json
   status "remove setting file"
   rm settings.json
}
