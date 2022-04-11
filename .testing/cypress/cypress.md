depencies were removed from the package.json

# install packages separately prior to running cypress tests:

"start-server-and-test": "^1.10.8"
"cypress": "^3.8.3",
"cypress-file-upload": "^3.5.3",

# meteor considerations

when calling a method directly, cypress somehow modifies the date to an empty object

https://forums.meteor.com/t/passing-date-objects-as-params-to-methods-in-cypress/48668

-> no solution found
