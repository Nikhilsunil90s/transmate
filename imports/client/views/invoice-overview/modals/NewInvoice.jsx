import React, { useContext } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { AutoField, AutoForm, RadioField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import PartnerSelect from "/imports/client/components/forms/uniforms/PartnerSelect.jsx";
import { DateField } from "/imports/client/components/forms/uniforms/DateInput.jsx";
import { NewInvoiceSchema } from "/imports/api/invoices/services/newInvoice.schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";
import { useMutation } from "@apollo/client";
import { CREATE_INVOICE } from "../utils/queries";

//#region components
let formRef;
export const NewInvoiceForm = ({ onSubmitForm, partnerId, accountType }) => {
  const { t } = useTranslation();
  const isShipper = accountType === "shipper";
  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(NewInvoiceSchema)}
      onSubmit={onSubmitForm}
      model={{
        partnerId,
        date: new Date(),
        role: isShipper ? "customer" : "vendor"
      }}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths="equal">
        <AutoField name="number" label={t("partner.billing.invoice.number")} />
        <DateField name="date" label={t("partner.billing.invoice.date")} />
      </Form.Group>
      <PartnerSelect name="partnerId" label={t("partner.billing.invoice.partner")} />
      {!isShipper && (
        <RadioField
          name="role"
          inline
          transform={role => <Trans i18nKey={`partner.billing.invoice.roles.${role}`} />}
          label={t("partner.billing.invoice.role")}
        />
      )}
    </AutoForm>
  );
};
//#endregion

NewInvoiceForm.propTypes = {
  onSubmitForm: PropTypes.func,
  partnerId: PropTypes.string,
  accountType: PropTypes.string
};

// either called with partner filled in, either partner is selected
const NewInvoiceModal = ({ show, showModal, partnerId }) => {
  const [createInvoice] = useMutation(CREATE_INVOICE);
  const { account } = useContext(LoginContext);
  const accountType = account.getType();
  const { goRoute } = useRoute();

  const onSubmitForm = ({ partnerId: selectedPartnerId, date, role, number }) => {
    createInvoice({
      variables: {
        input: {
          partnerId: selectedPartnerId,
          date,
          role,
          number
        }
      }
    })
      .then(({ data }) => {
        const invoiceId = data?.invoice?.id;
        if (!invoiceId) throw new Error("No ID returned");
        showModal(false);
        goRoute("invoice", { _id: invoiceId });
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not create invoice");
      });
  };
  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="partner.billing.invoice.modal.title" />}
      body={<NewInvoiceForm {...{ partnerId, onSubmitForm, accountType }} />}
      actions={<ModalActions onSave={() => formRef.submit()} showModal={showModal} />} // modalSubmitBtn created
    />
  );
};

NewInvoiceModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func,
  partnerId: PropTypes.string
};

export default NewInvoiceModal;
