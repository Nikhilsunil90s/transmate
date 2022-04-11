
install_meteor() {
 
  status "Installing Meteor (ignore any warnings about launcher scripts)"
  export PATH=/usr/bin:$PATH # necessary for install script to run from URL
  curl https://install.meteor.com | sh
  status "Updating PATH with Meteor"
  PATH=$HOME/.meteor:$PATH
}
