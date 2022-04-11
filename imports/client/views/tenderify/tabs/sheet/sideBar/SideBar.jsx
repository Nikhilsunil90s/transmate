import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useQuery, useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Header, List, Button, Form, Message, Icon } from "semantic-ui-react";
import { CurrencyTag, NumberTag, PartnerTag, PriceListTag } from "/imports/client/components/tags";
import { Emitter, Events } from "/imports/client/services/events";
import useRoute from "/imports/client/router/useRoute";
import { PriceListSelectModal } from "/imports/client/components/modals";
import { ConfirmComponent } from "/imports/client/components/modals";
import LoginContext from "/imports/client/context/loginContext";
import {
  GET_TENDER_BID_SIDEBAR_DATA,
  UPDATE_TENDER_BID_SIDEBAR,
  AUTO_SELECT_PRICELISTS_TENDER_BID
} from "./queries";

const debug = require("debug")("tenderBid");

export const TenderifySidebar = props => {
  const { accountId } = useContext(LoginContext);
  const [showPLModal, setShowPLModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ show: false, onConfirm: () => {} });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const { tenderBidId, tenderBid } = props;
  const { partner, tender } = tenderBid;

  const [updateTenderBid] = useMutation(UPDATE_TENDER_BID_SIDEBAR);
  const [doAutoSelectPriceLists, { loading: isLoadingPriceLists }] = useMutation(
    AUTO_SELECT_PRICELISTS_TENDER_BID,
    {
      variables: { tenderBidId }
    }
  );

  const onConfirmAction = action => {
    Emitter.emit(Events.CALCULATE_TENDER_BID, { action });
    showConfirm(false);
  };

  const actions = {
    generateFromPriceList: {
      icon: "lightning",
      onClick: () => setConfirmState({ show: true, onConfirm: () => onConfirmAction("calculate") })
    },
    reset: {
      icon: "undo",
      onClick: () => setConfirmState({ show: true, onConfirm: () => onConfirmAction("reset") })
    },
    recalculateFuelCorrection: { icon: "tint", onClick: () => alert("Are you sure?") },
    recalculateRevenue: { icon: "dollar", onClick: () => alert("Are you sure?") }
  };

  const addLinkedPriceList = ({ priceListId }) => {
    const priceListIdSet = new Set([...tenderBid.bidControl?.priceLists]);
    priceListIdSet.add(priceListId);
    updateTenderBid({
      variables: {
        input: { tenderBidId, updates: { settings: { priceListIds: [...priceListIdSet] } } }
      }
    })
      .then(() => {
        toast.success("Rate card added");
        setShowPLModal(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not add priceList");
      });
  };

  /**@param {string} priceListId */
  const removePriceListItem = priceListId => {
    const priceListIds = (tenderBid.settings?.priceListIds || []).filter(id => id !== priceListId);
    updateTenderBid({
      variables: {
        input: { tenderBidId, updates: { settings: { priceListIds } } }
      }
    })
      .then(() => {
        toast.success("Rate card removed");
        setShowPLModal(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not remove priceList");
      });
  };

  const autoSelectPriceLists = () => {
    doAutoSelectPriceLists()
      .then(({ data }) => {
        if (data?.tenderBidAutoSelectPricelists?.settings?.priceListIds?.length) {
          toast.success("Rate cards selected");
        } else {
          toast.info("No matching rate cards found (note: they need to be in active status)");
        }
      })
      .catch(err =>
        toast.error("Could not get matching rate cards. (note: they need to be in active status)")
      );
  };

  return (
    <div className="tenderify-bidControl">
      <Header as="h3" content={<Trans i18nKey="tenderify.bidControl.title" />} />
      {partner && (
        <>
          <Header as="h4" content={<Trans i18nKey="tenderify.bidControl.partner" />} />
          <Form>
            <Form.Field inline>
              <label>
                <Trans i18nKey="tenderify.partner.name" />
              </label>
              <PartnerTag accountId={partner.id} name={partner.name} />
            </Form.Field>
            {partner.management?.segment && (
              <Form.Field inline>
                <label>
                  <Trans i18nKey="tenderify.partner.segment" />
                </label>
                <span>{partner.management.segment}</span>
              </Form.Field>
            )}
            {tender.revenue && (
              <Form.Field inline>
                <label>
                  <Trans i18nKey="tenderify.partner.segment" />
                </label>
                <CurrencyTag value={tender.revenue.value} currency={tender.revenue.currency} />
              </Form.Field>
            )}
            {tender.volume && (
              <Form.Field inline>
                <label>
                  <Trans i18nKey="tenderify.partner.segment" />
                </label>
                <NumberTag value={tender.volume} suffix={tender.volumeUOM} />
              </Form.Field>
            )}
          </Form>
        </>
      )}
      <Header as="h4" content={<Trans i18nKey="tenderify.bidControl.actions.title" />} />
      <List
        items={Object.entries(actions).map(([key, action]) => (
          <List.Item
            key={key}
            icon={{ name: action.icon, size: "large", verticalAlign: "middle" }}
            content={
              <>
                <List.Header
                  as="a"
                  content={<Trans i18nKey={`tenderify.bidControl.actions.${key}`} />}
                  onClick={action.onClick}
                />
                <List.Description
                  content={<Trans i18nKey={`tenderify.bidControl.actions.${key}Info`} />}
                />
              </>
            }
          />
        ))}
      />
      <Header as="h4" content={<Trans i18nKey="tenderify.bidControl.priceLists" />} />
      {tenderBid.settings?.priceListIds?.length ? (
        <List>
          {tenderBid.settings.priceListIds.map((priceListId, i) => (
            <List.Item
              key={`linkedPriceList - ${i}`}
              icon="file outline"
              content={
                <>
                  <List.Content floated="right">
                    <Icon
                      name="close"
                      style={{ cursor: "pointer" }}
                      onClick={() => removePriceListItem(priceListId)}
                    />
                  </List.Content>
                  <List.Content>
                    <PriceListTag priceListId={priceListId} />
                  </List.Content>
                </>
              }
            />
          ))}
        </List>
      ) : (
        <Message content={<Trans i18nKey="tenderify.bidControl.priceListsEmpty" />} />
      )}
      <div style={{ whiteSpace: "nowrap" }}>
        <Button
          basic
          content={<Trans i18nKey="tenderify.bidControl.priceListsSelectBtn" />}
          onClick={() => setShowPLModal(true)}
        />
        <Button
          basic
          loading={isLoadingPriceLists}
          content={<Trans i18nKey="tenderify.bidControl.priceListAutoBtn" />}
          icon="lightning"
          onClick={autoSelectPriceLists}
        />
      </div>
      <PriceListSelectModal
        show={showPLModal}
        showModal={setShowPLModal}
        onSave={addLinkedPriceList}
        query={{ carrierId: accountId, type: "contract" }}
      />
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </div>
  );
};

TenderifySidebar.propTypes = {
  tenderBidId: PropTypes.string.isRequired,
  tenderBid: PropTypes.object,
  security: PropTypes.object
};

const TenderifySidebarLoader = () => {
  const {
    params: { _id: tenderBidId }
  } = useRoute();
  const { data = {}, loading, error } = useQuery(GET_TENDER_BID_SIDEBAR_DATA, {
    variables: { tenderBidId },
    fetchPolicy: "cache-only"
  });

  debug("sideBar data %o", { data, loading, error });

  if (loading) return "Loading...";
  if (!data.tenderBid) return "";

  return <TenderifySidebar tenderBidId={tenderBidId} tenderBid={data.tenderBid} />;
};

export default TenderifySidebarLoader;
