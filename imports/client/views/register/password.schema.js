import SimpleSchema from "simpl-schema";

const PASSWORD_REGEX = /[0-9]/;
const PLACEHOLDER_TEXT = "At least 6 characters, 1 number";

const OldPasswordSchema = new SimpleSchema({
  oldPwd: {
    type: String,
    uniforms: { type: "password" }
  }
});

const PasswordSchema = new SimpleSchema({
  password: {
    type: String,
    min: 6,
    regEx: PASSWORD_REGEX,
    uniforms: { type: "password" }
  },
  p2: {
    type: String,
    uniforms: { type: "password" },
    custom() {
      if (this.value !== this.field("password").value) {
        return "passwordMismatch";
      }
      return undefined;
    }
  }
});

PasswordSchema.messageBox.messages({
  en: {
    passwordMismatch: "Passwords do not match",
    regEx({ regExp }) {
      switch (regExp) {
        case PASSWORD_REGEX.toString():
          return "Password should have at least one number.";
        default:
          return "Value did not match regex";
      }
    }
  }
});

export { PasswordSchema, OldPasswordSchema, PASSWORD_REGEX, PLACEHOLDER_TEXT };
