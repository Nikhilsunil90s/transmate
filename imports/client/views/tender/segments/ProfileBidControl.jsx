/* eslint-disable react/no-danger */
import { toast } from "react-toastify";
import React, { useState, useContext } from "react";
import { useLazyQuery, useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";
import moment from "moment";
import { Segment, Grid, Message, Table, List, Button } from "semantic-ui-react";
import UploadModal from "/imports/client/components/modals/specific/Upload.jsx";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { uploadDocumentToCollection } from "/imports/utils/functions/fnUpload";
import { GET_MY_PRICELISTS, BID_FIXED_PRICELIST } from "../utils/queries";
import { SelectField } from "/imports/client/components/forms/uniforms/SelectField";
import { tabProptypes } from "../utils/propTypes";
import LoginContext from "/imports/client/context/loginContext";
import { generateRoutePath } from "/imports/client/router/routes-helpers";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tender:bid");

//#region components
const TenderBidSummary = ({ ...props }) => {
  const { tender = {} } = props;
  const myBids = get(tender, ["bidders", 0, "bids"]) || [];

  const totalBidGroups = (tender.packages || []).reduce(
    (memo, el) => memo + (get(el, ["bidGroups", "length"]) || 0),
    0
  );

  const nextMilestone = (tender?.timeline || []).find(el => moment(el.date).isAfter(moment()));

  return (
    <>
      <h3>{tender.title}</h3>
      <h4>
        <Trans i18nKey="tender.profile.bidder.title" />
      </h4>
      <Table basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell
              collapsing
              content={<Trans i18nKey="tender.profile.bidder.summaryGroupsTitle" />}
            />
            <Table.Cell
              content={
                <Trans
                  i18nKey="tender.profile.bidder.summaryGroups"
                  values={{
                    myBids: myBids.length,
                    totalBidGroups
                  }}
                />
              }
            />
          </Table.Row>
          {nextMilestone ? (
            <>
              <Table.Row>
                <Table.Cell collapsing content={<Trans i18nKey="tender.profile.bidder.due" />} />
                <Table.Cell content={nextMilestone.title} />
              </Table.Row>
              <Table.Row>
                <Table.Cell
                  collapsing
                  content={<Trans i18nKey="tender.profile.bidder.nextMilesone" />}
                />
                <Table.Cell
                  content={
                    <Trans
                      i18nKey="tender.profile.bidder.remaining"
                      remaining={moment(nextMilestone.date).fromNow()}
                    />
                  }
                />
              </Table.Row>
            </>
          ) : null}
        </Table.Body>
      </Table>
    </>
  );
};

const TenderBidItems = ({ ...props }) => {
  const { tender } = props;
  const myBid = get(tender, ["bidders", 0]);
  const offeredPriceLists = myBid.priceLists || [];
  const offeredDocuments = myBid.documents || [];

  const hasItemsToShow = myBid && (offeredPriceLists.length > 0 || offeredDocuments.length > 0);

  return hasItemsToShow ? (
    <>
      <h4 className="ui dividing header">
        <Trans i18nKey="tender.profile.bidder.items" />
      </h4>
      <List>
        {offeredPriceLists && (
          <List.Item>
            <List.Content>
              <List.Header content="Rate cards" />
              <List.List>
                {offeredPriceLists.map((priceList, i) => (
                  <List.Item key={`PL-${i}`}>
                    <List.Content>
                      <a
                        href={generateRoutePath("priceList", { _id: priceList.id })}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {priceList.title}
                      </a>
                    </List.Content>
                  </List.Item>
                ))}
              </List.List>
            </List.Content>
          </List.Item>
        )}
        {offeredDocuments && (
          <List.Item>
            <List.Content>
              <List.Header content="Documents" />
              <List.List>
                {offeredDocuments.map((doc, i) => (
                  <List.Item key={`doc-${i}`}>
                    <List.Content>
                      <a href={doc.id}>{doc.name}</a>
                    </List.Content>
                  </List.Item>
                ))}
              </List.List>
            </List.Content>
          </List.Item>
        )}
      </List>
    </>
  ) : null;
};

const TenderBidAction = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { accountId } = useContext(LoginContext);
  const [showUpload, showModalUpload] = useState(false);
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const [modalInputValue, setModalInputValue] = useState();

  const { goRoute, name: routeName } = useRoute();

  const { onSaveBid, tender, tenderId, refreshData } = props;
  const types = get(tender, ["params", "bid", "types"]) || [];
  const myPriceListId = get(tender, ["bidders", 0, "priceLists", 0, "id"]);
  debug("action: priceList attached? %o, %s", tender, myPriceListId);

  const [
    getPriceListOptions,
    { data: dataPriceLists = {}, loading: loadingPriceListOptions }
  ] = useLazyQuery(GET_MY_PRICELISTS, { variables: { input: { type: "contract" } } });

  const goAction = priceListId => {
    return goRoute("priceList", { _id: priceListId }, { redirect: routeName });
  };

  async function selectFixedPriceList() {
    debug("pricelist exists?", myPriceListId);
    if (myPriceListId) {
      debug("pricelist already exists, go to", myPriceListId);

      // we have a fixed price list that has been attached:
      return goAction(myPriceListId);
    }

    try {
      const { data = {}, errors } = await client.mutate({
        mutation: BID_FIXED_PRICELIST,
        variables: { tenderId }
      });

      if (errors) throw errors;
      debug("selectFixedPriceListResponse: %o", data);
      const priceListId = data.tenderBidFixedPriceList?.priceListId;
      if (!priceListId) throw new Error("no pricelist id returned");
      debug("pricelist id created:", priceListId);
      refreshData(); // update cache of tender
      return goAction(priceListId);
    } catch (error) {
      console.error({ error });
      return toast.error("Could not place offer");
    }
  }

  function saveSelectedPriceList() {
    const { priceListId } = modalInputValue;
    const myPriceLists = get(props, ["tender", "bidders", 0, "priceLists"]) || [];
    myPriceLists.push({
      id: priceListId,
      name: (dataPriceLists.priceLists || []).find(({ id }) => id === priceListId)?.name
    });
    onSaveBid("priceLists", myPriceLists);
  }

  function selectOwnPriceList() {
    getPriceListOptions();
    setModalState({
      show: true,
      title: "Select Rate card",
      body: (
        <div className="ui form">
          <SelectField
            onChange={value => setModalInputValue({ priceListId: value })}
            loading={loadingPriceListOptions}
            label={t("general.priceList")}
            options={(dataPriceLists.priceLists || []).map(item => ({
              key: item.id,
              value: item.id,
              text: `${item.title} <span style='opacity: .4; margin-left: .5em;'>${item.carrierName}</span>`
            }))}
          />
        </div>
      ),
      actions: <ModalActions {...{ showModal, onSave: saveSelectedPriceList }} />
    });
  }

  function uploadPriceListDocument() {
    showModalUpload(true);
  }
  function handleUpload({ type, file }) {
    const myDocs = get(props, ["tender", "bidders", 0, "documents"]) || [];
    uploadDocumentToCollection({
      file,
      directive: "tender.document",
      reference: { accountId, tenderId },
      type,
      accountId
    })
      .then(({ documentId, name }) => {
        toast.success("File succesfully uploaded");
        myDocs.push({
          id: documentId,
          name
        });
        onSaveBid("documents", { array: myDocs });
        showModalUpload(false);
      })
      .catch(err => {
        toast.error(err);
      });
  }

  return (
    <>
      <h4>Actions</h4>
      <Table basic>
        <Table.Body>
          {[
            ["file", t("analysis.uploadSimulationConfig"), uploadPriceListDocument],
            ["open", t("general.priceList"), selectOwnPriceList],
            ["priceList", "Fill out tender template", selectFixedPriceList]
          ]
            .filter(([type]) => types.includes(type))
            .filter(([type]) => !(["open", "priceList"].includes(type) && !!myPriceListId))
            .map(([type, txt, cb], i) => (
              <Table.Row key={`action-${i}`}>
                <Table.Cell collapsing content={txt} />
                <Table.Cell
                  content={
                    <Button
                      data-test={`placeBid-${type}`}
                      primary
                      icon="upload"
                      content="Place bid"
                      onClick={cb}
                    />
                  }
                />
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
      <UploadModal
        {...{
          show: showUpload,
          showModal: showModalUpload,
          title: "File upload",
          onSubmitForm: handleUpload
        }}
      />
      <ModalComponent {...modalState} showModal={showModal} />
    </>
  );
};

//#endregion

const ProfileBidControlSegment = ({ ...props }) => {
  const { security = {} } = props;
  const { isBidder, canPlaceBid } = security;

  return isBidder ? (
    <Segment
      data-test="bidControlSegment"
      padded="very"
      content={
        <>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                <TenderBidSummary {...props} />
              </Grid.Column>
              <Grid.Column>
                {canPlaceBid ? (
                  <TenderBidAction {...props} />
                ) : (
                  <Message warning content={<Trans i18nKey="tender.closed" />} />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <TenderBidItems {...props} />
        </>
      }
    />
  ) : null;
};

ProfileBidControlSegment.propTypes = tabProptypes;

export default ProfileBidControlSegment;
