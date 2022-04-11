/* eslint-disable new-cap */
/* eslint-disable func-names */
const i18nextParser = require("i18next-parser");
const gulp = require("gulp");
const debug = require("gulp-debug");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const count = require("gulp-count");
const { src, dest } = gulp;

const flatten = require("gulp-flatten");

gulp.task("i18next", function() {
  const onError = (path, err) => {
    console.error(err);
    notify.onError({
      title: "Gulp",
      subtitle: "Failure!",
      message: "Error: <%= error.message %>",
      sound: "Beep"
    })(err);

    return this.emit("end");
  };

  src(
    [
      "../../imports/**/*.js",
      "../../imports/**/*.jsx",

      "!../../imports/startup/server/check-browser.js",
      "!../../imports/**/node_modules/**/*.js",
      "!../../imports/biqquery/**/*.js",
      "!../../imports/biqquery/**/*.html"
    ],
    { base: "./" }
  )
    .pipe(
      i18nextParser({
        locales: ["en"],
        functions: ["t"],
        namespace: "translation",
        keepRemoved: true,
        namespaceSeparator: ":",
        useKeysAsDefaultValue: true,
        extension: ".$LOCALE.i18n.json",
        writeOld: true,
        ignoreVariables: true,
        output: "./locales",
        sort: true
      }).on("error:json", onError)
    )
    .pipe(dest("./locales"));

  // move files
  src(
    [
      "./locales/**/*.json",
      "!./locales/**/*_old*.json",
      "!./locales/**/translation.json"
    ],
    { base: "./" }
  )
    .pipe(flatten())
    .pipe(dest("../../public/locales/en"));
});

// gulp.task("i18next-modules", function() {
//   const onError = err => {
//     console.error(err);
//     notify.onError({
//       title: "Gulp",
//       subtitle: "Failure!",
//       message: "Error: <%= error.message %>",
//       sound: "Beep"
//     })(err);

//     return this.emit("end");
//   };

//   // price-list module
//   src(
//     [
//       "../../imports/client/views/price-list/**/*.html",
//       "../../imports/client/views/price-list/**/*.js",
//       "../../imports/client/views/price-lookup/**/*.html",
//       "../../imports/client/views/price-lookup/**/*.js",
//       "../../imports/api/priceLists/**/*.js",
//       "!../../imports/startup/server/check-browser.js"
//     ],
//     { base: "./" }
//   )
//     .pipe(
//       i18nextParser({
//         locales: ["en"],
//         functions: ["_", "__"],
//         namespace: "priceList",
//         keepRemoved: true,
//         namespaceSeparator: ":",
//         useKeysAsDefaultValue: true,
//         extension: ".$LOCALE.i18n.json",
//         writeOld: true,
//         ignoreVariables: true,
//         //! output pat needs to be relative to src( folder )
//         output: "./locales",
//         sort: true
//       })
//     )
//     .pipe(dest("./locales"));

//   // shipment module
//   src(
//     [
//       "../../imports/client/views/shipment/**/*.html",
//       "../../imports/client/views/shipments/**/*.js",
//       "../../imports/client/views/track/**/*.html",
//       "../../imports/client/views/track/**/*.js",
//       "../../imports/api/shipments/**/*.js",
//       "../../imports/api/stages/**/*.js",
//       "../../imports/api/items/**/*.js",
//       "../../imports/api/nonConformances/**/*.js",
//       "!../../imports/startup/server/check-browser.js"
//     ],
//     { base: "./" }
//   )
//     .pipe(
//       i18nextParser({
//         locales: ["en"],
//         functions: ["_", "__"],
//         namespace: "shipment",
//         keepRemoved: true,
//         namespaceSeparator: ":",
//         useKeysAsDefaultValue: true,
//         extension: ".$LOCALE.i18n.json",
//         writeOld: true,
//         ignoreVariables: true,
//         //! output pat needs to be relative to src( folder )
//         output: "./locales",
//         sort: true
//       })
//     )
//     .pipe(dest("./locales"));

//   // tender module
//   src(
//     [
//       "../../imports/client/views/tender/**/*.html",
//       "../../imports/client/views/tender/**/*.js",
//       "../../imports/api/tenders/**/*.js",

//       "!../../imports/startup/server/check-browser.js"
//     ],
//     { base: "./" }
//   )
//     .pipe(
//       i18nextParser({
//         locales: ["en"],
//         functions: ["_", "__"],
//         namespace: "tender",
//         keepRemoved: true,
//         namespaceSeparator: ":",
//         useKeysAsDefaultValue: true,
//         extension: ".$LOCALE.i18n.json",
//         writeOld: true,
//         ignoreVariables: true,
//         //! output pat needs to be relative to src( folder )
//         output: "./locales",
//         sort: true
//       })
//     )
//     .pipe(dest("./locales"));

//   // analysis module
//   src(
//     [
//       "../../imports/client/views/analysis/**/*.html",
//       "../../imports/client/views/analysis/**/*.js",
//       "../../imports/api/analysis/**/*.js",
//       "../../imports/api/analysis-simulationV2/**/*.js",
//       "../../imports/api/analysis-switchpoint/**/*.js",
//       "!../../imports/startup/server/check-browser.js"
//     ],
//     { base: "./" }
//   )
//     .pipe(
//       i18nextParser({
//         locales: ["en"],
//         functions: ["_", "__"],
//         namespace: "analysis",
//         keepRemoved: true,
//         namespaceSeparator: ":",
//         useKeysAsDefaultValue: true,
//         extension: ".$LOCALE.i18n.json",
//         writeOld: true,
//         ignoreVariables: true,
//         //! output pat needs to be relative to src( folder )
//         output: "./locales",
//         sort: true
//       })
//     )
//     .pipe(dest("./locales"));

//   src(
//     [
//       "../../imports/**/*.html",
//       "../../imports/**/*.js",

//       // price-list
//       "!../../imports/client/views/price-list/**/*.html",
//       "!../../imports/client/views/price-list/**/*.js",
//       "!../../imports/client/views/price-lookup/**/*.html",
//       "!../../imports/client/views/price-lookup/**/*.js",
//       "!../../imports/api/priceLists/**/*.js",

//       // shipments
//       "!../../imports/client/views/shipment/**/*.html",
//       "!../../imports/client/views/shipments/**/*.js",
//       "!../../imports/client/views/track/**/*.html",
//       "!../../imports/client/views/track/**/*.js",
//       "!../../imports/api/shipments/**/*.js",
//       "!../../imports/api/stages/**/*.js",
//       "!../../imports/api/items/**/*.js",
//       "!../../imports/api/nonConformances/**/*.js",

//       // tender
//       "!../../imports/client/views/tender/**/*.html",
//       "!../../imports/client/views/tender/**/*.js",
//       "!../../imports/api/tenders/**/*.js",

//       // analysis
//       "!../../imports/client/views/analysis/**/*.html",
//       "!../../imports/client/views/analysis/**/*.js",
//       "!../../imports/api/analysis/**/*.js",
//       "!../../imports/api/analysis-simulationV2/**/*.js",
//       "!../../imports/api/analysis-switchpoint/**/*.js",

//       "!../../imports/startup/server/check-browser.js"
//     ],
//     { base: "./" }
//   )
//     .pipe(
//       i18nextParser({
//         locales: ["en"],
//         functions: ["_", "__"],
//         namespace: "base",
//         keepRemoved: true,
//         namespaceSeparator: ":",
//         useKeysAsDefaultValue: true,
//         extension: ".$LOCALE.i18n.json",
//         writeOld: true,
//         ignoreVariables: true,
//         output: "./locales",
//         sort: true
//       })
//     )
//     .pipe(dest("./locales"));

//   // move files
//   src(
//     [
//       "./locales/**/*.json",
//       "!./locales/**/*_old*.json",
//       "!./locales/**/translation.json"
//     ],
//     { base: "./" }
//   )
//     .pipe(flatten())
//     .pipe(dest("../../i18n"));
// });
