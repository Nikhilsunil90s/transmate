import { toast } from "react-toastify";
import React from "react";
import { Segment, Button } from "semantic-ui-react";
import { gql, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";

import initializeConfirm from "/imports/client/components/modals/confirm";
import useRoute from "/imports/client/router/useRoute";

const REMOVE_ADDRESS_FROM_ADDRESS_BOOK = gql`
  mutation removeAddress($addressId: String!) {
    removeAddress(addressId: $addressId)
  }
`;
const debug = require("debug")("address:UI");

const AddressFooter = ({ security = {} }) => {
  const { t } = useTranslation();
  const { showConfirm, Confirm } = initializeConfirm();
  const { params, goRoute } = useRoute();
  const close = () => goRoute("addresses");
  const addressId = params._id;

  const [handleDelete] = useMutation(REMOVE_ADDRESS_FROM_ADDRESS_BOOK, {
    variables: { addressId },
    onCompleted() {
      goRoute("addresses");
    },
    onError(error) {
      debug("error in mutation %o", error);
      toast.error("Could not remove address");
    }
  });

  return (
    <Segment as="footer">
      <div>
        <Button primary icon="arrow left" content={t("form.back")} onClick={close} />
        {security.canDelete && (
          <Button
            className="delete"
            color="red"
            basic
            content={t("form.delete")}
            onClick={() => showConfirm(true)}
          />
        )}
        <Confirm content={t("address.form.delete_confirm")} onConfirm={handleDelete} />
      </div>
    </Segment>
  );
};

export default AddressFooter;
