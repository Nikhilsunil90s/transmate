import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import { CheckPartnershipSecurity } from "/imports/utils/security/checkUserPermissionsForPartnerShip";
import { CheckAccountSecurity } from "/imports/utils/security/checkUserPermissionsForAccount";
import { sAlertCallback } from "/imports/utils/UI/sAlertCallback";

// UI
import AccountProfileSegments from "./Profile";
import Loader from "../../../components/utilities/Loader.jsx";
import LoginContext from "/imports/client/context/loginContext";
import { GET_PROFILE_QUERY } from "../queries";
import { UPDATE_PARTNER } from "../../partner/utils/queries";

const debug = require("debug")("account:profile");

async function getData({ accountId, client }, callback) {
  try {
    const { errors, data } = await client.query({
      query: GET_PROFILE_QUERY,
      variables: {
        accountId
      },
      fetchPolicy: "no-cache"
    });

    if (errors && errors.length) throw errors[0];
    callback(null, data.getProfile);
  } catch (err) {
    callback(err);
  }
}

// gets called in a context (either partner page or own settings page)
const AccountProfile = ({ accountId }) => {
  const client = useApolloClient();
  const context = useContext(LoginContext);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [canEdit, setAccess] = useState(false);
  const isOwnAccount = accountId === context.accountId;
  const isCarrier = context.account.getType() === "carrier";

  const setAccessControl = ({ account }) => {
    let access = false;
    if (!isOwnAccount) {
      access = new CheckPartnershipSecurity({ partner: account }, context)
        .setContext(context)
        .can({ action: "canAnnotatePartner" })
        .check();
    } else {
      access = new CheckAccountSecurity({ account }, context)
        .setContext(context)
        .can({ action: "canEditAccountPortal" })
        .check();
    }
    setAccess(access);
  };
  const onSave = async update => {
    // callback will refresh the data after saving:

    debug("saving update", update);

    try {
      const { errors, data: res } = await client.mutate({
        mutation: UPDATE_PARTNER,
        variables: { input: { partnerId: accountId, update, root: "profile" } }
      });

      if (errors && errors.length) throw errors[0];
      getData({ accountId, client }, (error, result) => {
        setData(result);
      });
      sAlertCallback(null, res);
    } catch (err) {
      toast.error(err.message);
    }

    // FIXME: to GQL
    // Meteor.call("account.annotate", { accountId, update, root: "profile" }, callback);
  };

  useEffect(() => {
    setLoading(true);
    debug("profile for accountId", accountId);
    if (!accountId) return;
    getData({ accountId, client }, (error, result) => {
      debug("profile loader data %o", result);
      setData(result);
      setAccessControl({ account: result });
      setLoading(false);
      debug({ accountId, data: result });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  return (
    <>
      {loading && <Loader />}
      <AccountProfileSegments
        {...{
          // for account admin, partnerId same as accountId
          partnerId: accountId,
          profile: data,
          loading,
          canEdit,
          isOwnAccount,
          isCarrier,
          onSave
        }}
      />
    </>
  );
};

export default AccountProfile;
