module.exports = {
  Meteor: {
    call: (...args) => console.log({ args }),
    userId: () => {},
    users: {
      attachSchema: () => {}
    },
    user: () => ({}),
    subscribe: () => ({ ready: () => true }),
    settings: process.env.METEOR_SETTINGS
      ? {
          ...JSON.parse(process.env.METEOR_SETTINGS || {})
        }
      : { public: {} },
    Error: Error
  }
};
