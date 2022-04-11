
# install cypress (not as a dev-depency please)
# sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb

npm install cypress cypress-file-upload @cypress/webpack-preprocessor @cypress/code-coverage --no-save
npm run test:e2e
# after run do
# npm remove cypress cypress-file-upload @cypress/webpack-preprocessor

# dependencies
# sudo apt-get -y install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb