import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { SimpleDropdownModal } from "/imports/client/components/modals";
import { ADD_TENDER_BID_MAPPING, GET_TENDER_BID_MAPPINGS } from "../../../utils/queries";
import { Trans } from "react-i18next";
import { Button, Message } from "semantic-ui-react";
import TenderifyMappingAccordion from "./MappingAccordion";

const debug = require("debug")("tenderBid:mapping");

const TenderifyMapping = ({ ...props }) => {
  const { mappings } = props;
  return mappings?.length ? (
    <TenderifyMappingAccordion {...props} />
  ) : (
    <Message
      info
      icon="exclamation"
      header={<Trans i18nKey="tenderify.mapping.emptyTitle" />}
      content={<p>{<Trans i18nKey="tenderify.mapping.empty" />}</p>}
    />
  );
};

export const TenderifySectionMapping = ({ ...props }) => {
  const [show, showModal] = useState(false);
  const { tenderBidId, tenderBid, loading, security } = props;
  const docs = tenderBid?.source?.documents || [];
  const [addMapping] = useMutation(ADD_TENDER_BID_MAPPING, {
    onCompleted() {
      showModal(false);
      toast.success("Mapping added");
    },
    onError(error) {
      console.error({ error });
      toast.error("Could not add mapping");
    }
  });

  const onAddMapping = async ({ input }) => {
    const document = docs.find(({ id }) => id === input);

    addMapping({
      variables: {
        input: {
          tenderBidId,
          mapping: {
            fileId: document.id,
            fileType: document.meta.type,
            name: document.meta.name,
            url: document.store?.url || document.url
          }
        }
      }
    });
  };

  return (
    <IconSegment
      name="mapping"
      icon="exchange"
      title={<Trans i18nKey="tenderify.section.mapping.title" />}
      footer={
        security.addMapping ? (
          <>
            <Button
              primary
              content={<Trans i18nKey="tenderify.mapping.create" />}
              onClick={() => showModal(true)}
            />

            <SimpleDropdownModal
              show={show}
              showModal={showModal}
              title={<Trans i18nKey="tenderify.mapping.modal.title" />}
              label={<Trans i18nKey="tenderify.mapping.modal.label" />}
              options={docs.map(d => ({ key: d.id, value: d.id, text: d.meta.name }))}
              onSave={onAddMapping}
            />
          </>
        ) : null
      }
      loading={loading}
      body={<TenderifyMapping {...props} />}
    />
  );
};

let isPolling;
const TenderifySectionMappingLoader = ({ ...props }) => {
  const { tenderBidId } = props;

  const { data, loading, error, startPolling, stopPolling } = useQuery(GET_TENDER_BID_MAPPINGS, {
    variables: { tenderBidId }
  });

  debug("mapping data from server: %o", { data, error });

  if (error) console.error({ error });
  const mappings = data?.bidMappings?.mappings || [];

  useEffect(() => {
    const isProcessing = mappings.some(mapping => mapping.status?.processing);
    if (isProcessing && !isPolling) {
      debug("start polling");
      startPolling(1000);
      isPolling = true;
    }
    if (!isProcessing && isPolling) {
      debug("stop polling");
      stopPolling();
    }
  }, [mappings]);

  return <TenderifySectionMapping {...props} loading={loading} mappings={mappings} />;
};

export default TenderifySectionMappingLoader;
