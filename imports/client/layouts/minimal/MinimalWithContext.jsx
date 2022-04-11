import React from "react";
import { ApolloProvider, useQuery } from "@apollo/client";
import client from "/imports/client/services/apollo/client"; // root -> required
import PropTypes from "prop-types";
import { LoginProvider, providerContext } from "../../context/loginContext";

import { APP_ROOT_QUERY } from "../app/queries"; // same query as app layout
import MinimalLayout from "./Minimal.jsx";
import LogoLoading from "../../components/utilities/LogoLoading";

const debug = require("debug")("UI:root");

const MinimalLayoutLoader = ({ ...props }) => {
  // get user info -> subscription + fetch
  // get account info -> subscription + fetch
  // get account settings
  const { data = {}, loading, error } = useQuery(APP_ROOT_QUERY);

  if (error) console.error(error);
  debug("data %o", data);

  return loading ? (
    <LogoLoading />
  ) : (
    <LoginProvider value={providerContext(data)}>
      <MinimalLayout {...props} {...data} />
    </LoginProvider>
  );
};

const MinimalWithProvider = ({ ...props }) => {
  return (
    <ApolloProvider client={client}>
      <MinimalLayoutLoader {...props} />
    </ApolloProvider>
  );
};

MinimalWithProvider.propTypes = {
  name: PropTypes.string,
  sidebar: PropTypes.element,
  header: PropTypes.element,
  main: PropTypes.element,
  aside: PropTypes.element,
  asideCollapsed: PropTypes.bool,
  headerData: PropTypes.shape({
    back: PropTypes.string,
    title: PropTypes.string
  }), // has to be filled in already

  noGeneralSearch: PropTypes.bool
};

export default MinimalWithProvider;
