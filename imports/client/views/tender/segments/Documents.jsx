import { toast } from "react-toastify";
import React, { useContext, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Icon } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import { uploadDoc } from "/imports/utils/functions/fnUpload";
import UploadModal from "/imports/client/components/modals/specific/Upload.jsx";
import { ADD_ATTACHMENT, REMOVE_ATTACHMENT } from "../utils/queries";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { ReactTable } from "/imports/client/components/tables";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("tender:UI");

const DocumentSection = ({ ...props }) => {
  const { accountId } = useContext(LoginContext);
  const client = useApolloClient();
  const [show, showModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = showC => setConfirmState({ ...confirmState, show: showC });
  const { tenderId, tender = {}, security = {} } = props;
  const canEdit = security.canEditGeneral;
  const documents = tender.documents || [];

  async function onSubmitForm({ file }) {
    try {
      const { meta, store } = await uploadDoc({
        file,
        directive: "tender.document",
        reference: {
          accountId,
          tenderId
        },
        accountId
      });

      await client.mutate({
        mutation: ADD_ATTACHMENT,
        variables: { input: { tenderId, attachment: { meta, store } } }
      }); // updates data

      toast.success("Document stored");
      showModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not save your document");
    }
  }

  async function removeDocument() {
    debug("removing document %s", confirmState.id);
    try {
      await client.mutate({
        mutation: REMOVE_ATTACHMENT,
        variables: { input: { tenderId, id: confirmState.id } }
      });
      toast.info("Document removed");
      setConfirmState({ show: false });
    } catch (error) {
      console.error(error);
      toast.error("Could not remove document");
    }
  }

  return (
    <IconSegment
      name="documents"
      icon="file outline"
      title={<Trans i18nKey="tender.document.title" />}
      body={
        <>
          {documents.length > 0 ? (
            <ReactTable
              TheadComponent={() => null}
              columns={[
                {
                  id: "icon",
                  accessor: "icon",
                  className: "collapsing",
                  Cell: ({ value }) => <Icon name={value} size="large" />
                },
                { id: "name", accessor: "meta.name" },
                {
                  id: "actions",
                  accessor: "id",
                  Cell: ({ row: { original: doc } }) => {
                    return (
                      <Button.Group>
                        <Button as="a" href={doc.url} target="doc" icon="eye" />
                        <Button as="a" href={doc.url} target="doc" icon="download" />
                        {canEdit && (
                          <Button
                            as="a"
                            onClick={() => setConfirmState({ id: doc.id, show: true })}
                            target="doc"
                            icon="trash"
                          />
                        )}
                      </Button.Group>
                    );
                  }
                }
              ]}
              data={documents}
              tableClass="ui table"
            />
          ) : (
            <Trans i18nKey="tender.document.empty" />
          )}

          {canEdit && (
            <>
              <br />
              <Button
                basic
                primary
                icon="add circle"
                content={<Trans i18nKey="tender.document.add" />}
                onClick={() => showModal(true)}
              />
            </>
          )}
          <UploadModal
            {...{ show, showModal, title: <Trans i18nKey="tender.document.add" />, onSubmitForm }}
          />
          <ConfirmComponent
            {...{ show: confirmState.show, showConfirm }}
            onConfirm={removeDocument}
          />
        </>
      }
    />
  );
};

export default DocumentSection;
