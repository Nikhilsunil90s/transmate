import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { Segment, Button, Card, Icon } from "semantic-ui-react";

import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import PartnerModal from "./modals/Partner.jsx";

import { UPDATE_SHIPMENT_PARTNERS } from "./utils/queries";

const debug = require("debug")("shipment:UI");

function getPartnerData(partner) {
  return { id: partner.id, name: partner?.annotation?.name || partner.name, role: "Shipper" };
}
function preparePartners(shipment = {}) {
  const { shipper, consignee, providers = [] } = shipment;
  return [
    ...(shipper ? [{ ...getPartnerData(shipper), role: "Shipper" }] : []),
    ...(consignee ? [{ ...getPartnerData(consignee), role: "Consignee" }] : []),
    ...providers.map(provider => ({ ...getPartnerData(provider), role: "Provider" }))
  ];
}

export const ShipmentPartnersSection = ({ shipmentId, shipment = {}, security }) => {
  const client = useApolloClient();
  const { canEditPartners: canEdit } = security;
  const [confirmState, setConfirmState] = useState({ show: false });
  const [modalData, setModalData] = useState({ show: false });
  const partners = preparePartners(shipment);
  const hasPartners = partners.length > 0;

  const onSavePartners = ({ partner, remove }, cb) => {
    debug("partner update %o", { partner, remove });

    client
      .mutate({
        mutation: UPDATE_SHIPMENT_PARTNERS,
        variables: { input: { shipmentId, partner, remove } }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Partner saved");
        cb();
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save partner");
      });
  };

  const showConfirm = show => setConfirmState({ ...confirmState, show });
  function confirmBeforeDelete(partnerId, role) {
    setConfirmState({
      ...confirmState,
      show: true,
      onConfirm: () => {
        debug("remove partner %s", partnerId, role);
        const cb = () => showConfirm(false);
        onSavePartners({ partner: { partnerId, role: role.toLowerCase() }, remove: true }, cb);
      }
    });
  }

  function showModal(visible) {
    setModalData({ ...modalData, show: visible });
  }

  function onSaveModal({ partner }) {
    onSavePartners({ partner }, () => showModal(false));
  }

  return (
    <Segment basic padded className="partners grid">
      {hasPartners && (
        <Card.Group>
          {partners.map((partner, i) => (
            <Card
              key={i}
              content={
                <Card.Content>
                  {canEdit && partner.role !== "Shipper" && (
                    <Icon
                      style={{ cursor: "pointer" }}
                      name="trash"
                      className="right floated"
                      onClick={_ => {
                        _.stopPropagation();
                        confirmBeforeDelete(partner.id, partner.role);
                      }}
                    />
                  )}
                  {canEdit && partner.role === "Shipper" && (
                    <Icon
                      style={{ cursor: "pointer" }}
                      name="edit"
                      className="right floated"
                      onClick={_ => {
                        _.stopPropagation();
                        setModalData({
                          show: true,
                          data: { partnerId: partner.id, role: partner.role }
                        });
                      }}
                    />
                  )}
                  <Card.Header content={partner.name} />
                  <Card.Description content={<p>{partner.role}</p>} />
                </Card.Content>
              }
            />
          ))}
        </Card.Group>
      )}

      {canEdit && (
        <div className="row">
          <Button
            primary
            content={<Trans i18nKey="shipment.partners.title" />}
            onClick={() => setModalData({ show: true })}
          />
        </div>
      )}
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
      <PartnerModal {...modalData} onSavePartner={onSaveModal} showModal={showModal} />
    </Segment>
  );
};

export default ShipmentPartnersSection;
