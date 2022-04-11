import Ajv from "ajv";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";

export const initJSONschema = (schema: Object) => {
  const ajv = new Ajv({
    allErrors: true,
    useDefaults: true

    // keywords: ["uniforms"]
  });
  function createValidator(s) {
    const validator = ajv.compile(s);

    return model => {
      validator(model);

      if (validator.errors && validator.errors.length) {
        return { details: validator.errors };
      }
      return undefined;
    };
  }

  const schemaValidator = createValidator(schema);
  const bridge = new JSONSchemaBridge(schema, schemaValidator);
  return bridge;
};
