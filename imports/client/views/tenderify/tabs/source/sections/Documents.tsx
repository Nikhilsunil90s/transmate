import { toast } from "react-toastify";
import { Random } from "/imports/utils/functions/random.js";
import { useMutation } from "@apollo/client";
import React, { useContext, useState } from "react";
import { Grid, List, Icon, Header, Button } from "semantic-ui-react";
import { uploadDoc } from "/imports/utils/functions/fnUpload";
import UploadModal from "/imports/client/components/modals/specific/Upload.jsx";
import {
  REMOVE_DOCUMENT,
  ADD_TENDERIFY_DOCUMENT
} from "../../../utils/queries";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { Trans } from "react-i18next";
import { ConfirmComponent } from "/imports/client/components/modals";
import LoginContext from "/imports/client/context/loginContext";

type ConfirmState = {
  show: boolean;
  documentId?: string;
};

const TenderifySectionSourceDocs = ({ ...props }) => {
  const { accountId } = useContext(LoginContext);
  const { tenderBidId, tenderBid, security } = props;
  const canEdit = security.editGeneral;
  const [show, showModal] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    show: false
  });
  const [uploadDocument] = useMutation(ADD_TENDERIFY_DOCUMENT);
  const [removeDocument] = useMutation(REMOVE_DOCUMENT);

  const handleFileUpload = async ({ file }) => {
    const fileId = Random.id(5);
    try {
      const { meta, store } = await uploadDoc({
        file,
        accountId,
        directive: "tenderify.document",
        reference: {
          accountId,
          tenderBidId,
          id: fileId
        }
      });

      const { errors } = await uploadDocument({
        variables: {
          input: { tenderBidId, document: { meta, store, id: fileId } }
        }
      }); // updates data

      if (errors) throw errors;
      toast.success("Document stored");
      showModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not save your document");
    }
  };

  const handleDocRemove = () => {
    const { documentId } = confirmState;
    if (!documentId) return;
    removeDocument({
      variables: { input: { tenderBidId, documentId } }
    }).then(() => setConfirmState({ show: false }));
  };
  return (
    <IconSegment
      name="source"
      icon="cloud download"
      title={<Trans i18nKey="tenderify.section.source.title" />}
      body={
        <Grid columns={2}>
          <Grid.Column>
            {/* <form class="ui form">
        {{> Dropdown
        name="source.type"
        value=bid.source.type
        options=sourceOptions
        allowAdditions=true
      }}
      </form> */}
          </Grid.Column>
          <Grid.Column>
            <Header
              as="h4"
              content={
                <Trans i18nKey="tenderify.section.source.documents.title" />
              }
            />
            <List>
              {(tenderBid.source?.documents || []).map((doc, i) => (
                <List.Item key={`docItem-${i}`}>
                  {canEdit && (
                    <List.Content floated="right">
                      <Icon
                        name="trash alternate outline"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setConfirmState({ show: true, documentId: doc.id })
                        }
                      />
                    </List.Content>
                  )}
                  <List.Icon name={doc.icon} />{" "}
                  {/* needs to be projected in query */}
                  <List.Content>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.meta?.name || "File"}
                    </a>
                  </List.Content>
                </List.Item>
              ))}
            </List>
            <ConfirmComponent
              show={confirmState.show}
              showConfirm={show => setConfirmState({ ...confirmState, show })}
              onConfirm={handleDocRemove}
            />
          </Grid.Column>
          <Grid.Column>
            {canEdit && (
              <>
                <Button
                  primary
                  content={
                    <Trans i18nKey="tenderify.section.source.documents.add" />
                  }
                  onClick={() => showModal(true)}
                />
                <UploadModal
                  title="Upload file"
                  show={show}
                  showModal={showModal}
                  onSubmitForm={handleFileUpload}
                />
              </>
            )}
          </Grid.Column>
        </Grid>
      }
      children={undefined}
      footerElement={undefined}
      headerButton={undefined}
      onHeaderButtonClick={undefined}
      headerContent={undefined}
    />
  );
};

export default TenderifySectionSourceDocs;
