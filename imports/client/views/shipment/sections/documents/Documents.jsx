import { toast } from "react-toastify";
import React, { useContext, useState } from "react";

import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Dropdown, Icon, Button } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import ShipmentDocumentModal from "./modals/Document";
import { uploadDoc } from "/imports/utils/functions/fnUpload";
import { mutate } from "/imports/utils/UI/mutate";

import { ADD_SHIPMENT_DOCUMENT, REMOVE_SHIPMENT_DOC, GENERATE_SHIPMENT_DOC } from "./utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("shipment:documents:view");

//#region components
const DocumentOverview = ({ shipment, security = {} }) => {
  const client = useApolloClient();
  const documents = shipment?.documents || [];
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const hasDocuments = documents.length > 0;
  const { params } = useRoute();

  function confirmBeforeDelete(documentId) {
    setConfirmState({
      ...confirmState,
      show: true,
      onConfirm: () => {
        debug("remove document %s", documentId);
        client
          .mutate({
            mutation: REMOVE_SHIPMENT_DOC,
            variables: {
              input: {
                documentId,
                shipmentId: params._id
              }
            }
          })
          .then(({ errors }) => {
            if (errors) throw errors;
            toast.success("Document has been removed");
            showConfirm(false);
          })
          .catch(err => {
            console.error(err);
            toast.error("Could not remove document");
          });
      }
    });
  }

  const columns = [
    {
      id: "icon",
      accessor: "icon",
      className: "collapsing",
      Cell: ({ value }) => <Icon name={value} size="large" />
    },
    {
      id: "type",
      accessor: "type",
      className: "collapsing",
      Cell: ({ value: type }) => {
        const docType = type || "other";
        return <Trans i18nKey={`shipment.form.document.types.${docType}`} />;
      }
    },
    { id: "name", accessor: "meta.name" },
    {
      id: "actions",
      accessor: "id",
      Cell: ({ row: { original: doc } }) => {
        const canDelete = security.check.can({ action: "editDocument", data: doc }).check();
        return (
          <Button.Group basic>
            <Button as="a" href={doc.url} target="doc" icon="eye" />
            <Button as="a" href={doc.url} target="doc" icon="download" />
            {canDelete && (
              <Button
                as="a"
                onClick={() => confirmBeforeDelete(doc.id)}
                target="doc"
                icon="trash"
              />
            )}
          </Button.Group>
        );
      }
    }
  ];

  return hasDocuments ? (
    <>
      <ReactTable
        TheadComponent={() => null}
        columns={columns}
        data={documents}
        tableClass="ui table"
      />
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </>
  ) : (
    <Trans i18nKey="shipment.documents.empty" />
  );
};

const SectionFooter = () => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { params } = useRoute();
  const { accountId } = useContext(LoginContext);

  // modal for file upload
  const [show, showModal] = useState(false);

  // generate delivery note document
  function createDeliveryNote() {
    debug("creation delivery note started...");
    toast.info("Creating delivery note ...");
    mutate({
      client,
      query: {
        mutation: GENERATE_SHIPMENT_DOC,
        variables: {
          input: {
            shipmentId: params._id,
            type: "deliveryNote"
          }
        }
      },
      successMsg: "Document generated",
      errorMsg: "Unable to generate document"
    });
  }
  function onSubmitForm({ type, file }) {
    const reference = { shipmentId: params._id };
    uploadDoc({
      file,
      directive: "shipment.document",
      reference,
      accountId
    })
      .then(({ meta, store }) => {
        debug("data from submit %o", store);
        return client.mutate({
          mutation: ADD_SHIPMENT_DOCUMENT,
          variables: {
            input: {
              link: { ...reference },
              data: {
                type,
                meta,
                store
              }
            }
          }
        });
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("File succesfully uploaded");
        showModal(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not upload file");
      });
  }
  return (
    <>
      <Dropdown button className="primary" text={t("form.add")}>
        <Dropdown.Menu>
          <Dropdown.Item
            text={t("shipment.documents.options.file")}
            onClick={() => showModal(true)}
          />
          <Dropdown.Divider />
          <Dropdown.Item
            text={t("shipment.documents.options.deliveryNote")}
            onClick={createDeliveryNote}
          />
        </Dropdown.Menu>
      </Dropdown>
      <ShipmentDocumentModal {...{ show, showModal, onSubmitForm }} />
    </>
  );
};

export const ShipmentDocumentsSection = ({ ...props }) => {
  const { security = {} } = props;
  return (
    <IconSegment
      title={<Trans i18nKey="shipment.documents.title" />}
      icon="file outline"
      body={<DocumentOverview {...props} />}
      footer={security.canAddDocuments ? <SectionFooter {...props} /> : undefined}
    />
  );
};
//#endregion

export default ShipmentDocumentsSection;
