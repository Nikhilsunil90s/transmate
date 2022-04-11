"use strict";

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  "forbid-only": true,
  // jobs:1, //serial (as opposed to parallel)
  timeout: 10000
  //   diff: true,
  //   extension: ['js'],
  //   package: './package.json',
  //   reporter: 'spec',
  //   slow: 75,
  //   timeout: 2000,
  //   ui: 'bdd',
  //   'watch-files': ['lib/**/*.js', 'test/**/*.js'],
  //   'watch-ignore': ['lib/vendor']
};
