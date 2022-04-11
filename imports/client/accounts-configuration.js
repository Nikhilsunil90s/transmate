import { Accounts } from "meteor/accounts-base";
import { AccountsTemplates } from "./router/AccountsTemplatesPlaceHolder";

AccountsTemplates.configure({
  defaultLayout: "RegisterLayout",

  // defaultContentRegion: "main",

  // defaultLayoutRegions: {}
  hideSignUpLink: true,
  showForgotPasswordLink: true,
  texts: {
    title: {
      signIn: "Sign in with your Transmate Account"
    }
  }
});

Accounts.config({
  passwordResetTokenExpirationInDays: 2,
  passwordEnrollTokenExpirationInDays: 3
});

Accounts.onEmailVerificationLink(Accounts.verifyEmail);
