class DDPLink {}
class ApolloClient {
  watchQuery() {}
}
class InMemoryCache {}
const useQuery = () => ({ data: {}, loading: true, error: false });
const useMutation = () => [];
const useLazyQuery = () => [() => {}, {}];
const useApolloClient={
  async query(){
    return {}
  }
}
const setup =()=>{}
export {
  setup,
  InMemoryCache,
  DDPLink,
  useQuery,
  useMutation,
  useLazyQuery,
  ApolloClient,
  useApolloClient
};
export default ApolloClient;
