import React, { useContext } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import moment from "moment";
import { Segment, List, Icon, Header } from "semantic-ui-react";
import { FileUpload } from "/imports/client/components/forms/input/FileUpload.jsx";
import { uploadDoc } from "/imports/utils/functions/fnUpload";

import { REMOVE_ATTACHMENT, ADD_ATTACHMENT } from "../utils/queries";
import LoginContext from "/imports/client/context/loginContext";

const PriceListAttachmentSection = ({ ...props }) => {
  const { accountId } = useContext(LoginContext);
  const { security, priceList, refetch } = props;
  const priceListId = priceList.id;
  const attachments = priceList.attachments || [];

  const [removeAttachment] = useMutation(REMOVE_ATTACHMENT);
  const [addAttachment] = useMutation(ADD_ATTACHMENT);

  function handleFile(file) {
    if (!file && !priceListId) return toast.error("Please select a file.");

    uploadDoc({
      file,
      directive: "pricelist.attachment",
      reference: { id: priceListId },
      accountId
    })
      .then(({ meta, store }) => {
        addAttachment({ variables: { input: { priceListId, attachment: { meta, store } } } })
          .then(() => {
            refetch();
            return toast.success("Document stored");
          })
          .catch(e => {
            throw e;
          });
      })
      .catch(err => {
        return toast.error(err.reason);
      });
    return null;
  }

  function deleteAttachment(index) {
    removeAttachment({
      variables: {
        priceListId,
        index
      }
    });
  }
  return (
    <Segment padded="very" className="attachments">
      <Header as="h2" content={<Trans i18nKey="price.list.attachments" />} />
      {security.canAddAttachment && (
        <FileUpload name="priceListFile" onChange={selectedFile => handleFile(selectedFile)} />
      )}
      {attachments.length > 0 && (
        <List relaxed>
          {attachments.map((attachment, i) => (
            <List.Item key={i}>
              {attachment.accountId === accountId && (
                <List.Content
                  floated="right"
                  content={
                    <Icon
                      name="trash"
                      style={{ cursor: "pointer" }}
                      onClick={() => deleteAttachment(i)}
                    />
                  }
                />
              )}
              <Icon name="file" />
              <a
                href={attachment.link}
                title={attachment.meta.name}
                target="_blank"
                rel="noreferrer"
              >
                {attachment.meta.name}
              </a>
              <span style={{ opacity: 0.6 }}>
                {attachment.accountId} - {moment(attachment.added?.at).fromNow()}
              </span>
            </List.Item>
          ))}
        </List>
      )}
    </Segment>
  );
};

export default PriceListAttachmentSection;
