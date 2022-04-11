export const rules = {
  p1: {
    identifier: "p1",
    rules: [
      { type: "minLength[6]" },
      { type: "empty" },
      {
        type: "regExp[/[0-9]/]",
        prompt: "Password should have at least 1 decimal character"
      }
    ]
  },
  p2: {
    identifier: "p2",
    rules: [
      {
        type: "match[p1]",
        prompt: "Password should match"
      }
    ]
  }
};
