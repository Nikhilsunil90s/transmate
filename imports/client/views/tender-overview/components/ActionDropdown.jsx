import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";

import React, { useContext } from "react";
import { Dropdown } from "semantic-ui-react";
import { DUPLICATE_TENDER } from "../utils/queries";
import LoginContext from "/imports/client/context/loginContext";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tender:overview");

const Actions = ({ tender = {} }) => {
  const client = useApolloClient();
  const { accountId } = useContext(LoginContext);
  const { id: tenderId, accountId: accountIdInTender } = tender || {};

  const { goRoute } = useRoute();

  if (!tenderId || accountIdInTender !== accountId) return null;

  const handleMainDropDownClick = event => {
    event.stopPropagation();
  };

  async function duplicate(shouldDuplicateWithData) {
    try {
      const { data = {}, errors } = await client.mutate({
        mutation: DUPLICATE_TENDER,
        variables: { input: { tenderId, keepData: shouldDuplicateWithData } }
      });
      if (errors) throw errors;
      debug("duplication mutation result", data);
      const generatedId = data.duplicateTender?.id;
      if (!generatedId) throw new Error("no id returned");
      goRoute("tender", { _id: generatedId });
    } catch (error) {
      console.error({ error });
      toast.error("Tender could not be duplicated");
    }
  }

  // todo prevent wide clicking
  return (
    <Dropdown
      onClick={handleMainDropDownClick}
      style={{ width: "100%", height: "100%" }}
      text=""
      pointing="right"
    >
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => duplicate(false)} text="Duplicate without data" />
        <Dropdown.Item disabled onClick={() => duplicate(true)} text="Duplicate with data" />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Actions;
