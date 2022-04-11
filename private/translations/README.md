## Translation

### getting started

- npm install -g gulp@3.9.1
- npm install -D (in folder)
- either run gulp i18next or use the runcommand in the project root

### workflow:

when creating new tags

1. run gulp i18next
2. new tags are discovered
3. edit the translation in locales\<language>\file.json
4. run gulp i18next again -> this will copy over the files to the project with the correct translation

### watchouts

- variables are not parsed (e.g. in js files we have a \${val} where for each key a translation is checked) -> these are not parsed and should be added manually
- old keys are not removed (as this would delete the manually added keys from above!)
