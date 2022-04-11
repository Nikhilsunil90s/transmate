import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useQuery } from "@apollo/client";
import useRoute from "../../router/useRoute";
import { DECODE_USER_TOKEN_QUERY } from "./queries";

const debug = require("debug")("token");

const TokenLogin = () => {
  const { goRoute, params } = useRoute();
  const { token } = params;

  const { data, error, loading } = useQuery(DECODE_USER_TOKEN_QUERY, {
    variables: { token },
    fetchPolicy: "no-cache",
    skip: !token
  });

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!error) {
      const { route, meteorToken, err } = data.decodeToken || {};
      if (err || !meteorToken || !meteorToken.token) {
        debug("ERROR:", err);
        goRoute("signIn");
        toast.error("Invalid token!");
      } else {
        Meteor.loginWithToken(meteorToken.token, err => {
          if (!err) {
            debug("go route %o after login", route);

            // to do : allow redirects without id and section
            goRoute(route.page, {
              _id: route._id,
              section: route.section
            });
          } else {
            goRoute("signIn");
            toast.error("Not able to login with token!");
          }
        });
      }
    } else {
      goRoute("signIn");
      toast.error("Missing token!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return <div>Please wait while we&apos;re logging you in....</div>;
};

export default TokenLogin;
