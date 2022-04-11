export TOOL_NODE_FLAGS="--max-old-space-size=3072"
export NODE_OPTIONS="--max_old_space_size=3072"
METEOR_HOME=.meteor/local
PATH=$METEOR_HOME/usr/bin:$METEOR_HOME/usr/lib/meteor/bin:$PATH

status() {
  echo "-----> $*"
}

#!/bin/bash
# Configure Git.
git config --global credential.https://github.com.helper cache
git credential approve <<EOF
protocol=https
host=github.com
username=parcelsolutions
password=${GITHUB_READ_TOKEN}
EOF
git config --global user.email "jan@transmate-eu.eu"
git config --global user.name "Jan Carpentier"