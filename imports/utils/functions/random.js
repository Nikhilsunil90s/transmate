const { customAlphabet, nanoid } = require("nanoid");

const METEOR_ID_ALPHABET =
  "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";

export const Random = {
  id(len = 17) {
    const nanoidWithCustomAlphabet = customAlphabet(METEOR_ID_ALPHABET, len);
    return nanoidWithCustomAlphabet(); // = > "uvZ7knEH2tM66QQeQ"
  },

  secret(len = 43) {
    return nanoid(len);
  }
};
