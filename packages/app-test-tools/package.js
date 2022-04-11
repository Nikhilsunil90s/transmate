Package.describe({
  summary: "Loads packages only in test",
  testOnly: true,
  documentation: null
});

Package.onUse(api => {
  api.versionsFrom("1.2.1");

  api.use([
    "xolvio:cleaner",
    "dburles:factory",
    "hubroedu:mocha",
    "hwillson:stub-collections",
    "johanbrook:publication-collector"
  ]);
});
