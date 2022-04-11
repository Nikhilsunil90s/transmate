export const resolvers = {
  Query: {
    async getCurrentTime() {
      return new Date();
    }
  }
};
