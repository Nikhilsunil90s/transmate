// Assure it's available globally.

import "/imports/startup/client";
import "/imports/startup/both";

const jQuery = require("jquery/dist/jquery.js");

window.jQuery = jQuery;
