const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const destinationPath = process.argv[2];

const walkSync = function(destinationPath, filelist, fileHandler) {
  const files = fs.readdirSync(destinationPath);
  filelist = filelist || [];

  files.forEach(function(file) {
    if (fs.statSync(destinationPath + file).isDirectory()) {
      filelist = walkSync(destinationPath + file + "/", filelist, fileHandler);
    } else {
      fileHandler(path, file, destinationPath);
    }
  });
};

// walkSync(destinationPath, [], (path, file, destinationPath) => {
//   if (path.extname(file) === ".coffee") {
//     exec(`coffee -c ${destinationPath + file}`);
//   }
// });

walkSync(destinationPath, [], (path, file, destinationPath) => {
  if (path.extname(file) === ".coffee") {
    fs.unlinkSync(destinationPath + file);
  }
});

// walkSync(destinationPath, [], (path, file, destinationPath) => {
//   if (path.extname(file) === ".js") {
//     // Change .coffee to .js
//     fs.readFile(destinationPath + file, "utf8", function(err, data) {
//       if (err) {
//         return console.error(err);
//       }
//       const result = data.replace(/\.coffee/g, ".js");

//       fs.writeFile(destinationPath + file, result, "utf8", function(err) {
//         if (err) {
//           return console.error(err);
//         }
//       });
//     });
//   }
// });
