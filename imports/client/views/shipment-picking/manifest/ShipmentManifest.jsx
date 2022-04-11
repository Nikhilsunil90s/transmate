/* eslint-disable react/no-danger */
import React, { useState, useContext, useEffect } from "react";
import { Card, Grid, Checkbox, Container, Segment, Message } from "semantic-ui-react";
import isEmpty from "lodash.isempty";
import get from "lodash.get";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";

import { ConfirmComponent } from "/imports/client/components/modals";
import LoginContext from "/imports/client/context/loginContext";
import { GET_MANIFEST, PRINT_SHIPPING_MANIFEST } from "../utils/queries";
import CarrierItem from "./components/CarrierItem";
import ManifestPrintout from "./components/ManifestPrintout";
import PackingFooter from "../detail/components/PackingFooter";
import { printPage } from "../utils/printPage";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("picking:UI");

const ShipmentManifest = () => {
  const [printManifest, setPrintmanifest] = useState(true);
  const [confirmState, setConfirmState] = useState({ show: false });
  const { user } = useContext(LoginContext);
  const { t } = useTranslation();
  const addressId = get(user, ["preferences", "picking", "addressId"], null);
  const { goRoute } = useRoute();

  useEffect(() => {
    if (!addressId) goRoute("/picking-overview");
  }, []);

  const showConfirm = showConfirmState =>
    setConfirmState({ ...confirmState, show: showConfirmState });
  debug("addressId", addressId);
  const { data = {}, loading, error } = useQuery(GET_MANIFEST, {
    variables: { addressId },
    skip: !addressId
  });
  debug("manifest data %o", data, loading, error);

  const [printPickingManifest] = useMutation(PRINT_SHIPPING_MANIFEST, {
    onError: () => toast.error("Could not print manifest"),
    onCompleted: (mData = {}) => {
      showConfirm(false);
      if (printManifest && mData.shipments?.length) {
        printPage(<ManifestPrintout shipments={mData.shipments} />);
      }

      // window.open(documentUrl);
    }
  });

  const onPrintManifest = () => {
    const { shipmentIds } = confirmState;

    printPickingManifest({
      variables: {
        input: { shipmentIds, printManifest }
      }
    });
  };

  const onItemClick = (shipments, name) => {
    const shipmentIds = shipments.map(({ id }) => id);

    setConfirmState({ show: true, shipmentIds, name });
  };

  const onChange = (e, { checked }) => setPrintmanifest(Boolean(checked));

  if (loading) return <Trans i18nKey="general.loading" />;
  if (isEmpty(data)) return null;

  const { carriers = [] } = data;

  return (
    <>
      <div>
        <Container>
          <Segment>
            <h1 className="ts-shipment-pick__heading">
              <Trans i18nKey="picking.manifest.header" />
            </h1>
            <Message info content={<Trans i18nKey="picking.manifest.info" />} />

            {Boolean(carriers.length) ? (
              <Grid columns="2" verticalAlign="middle">
                <Grid.Row>
                  <Grid.Column>
                    <Card.Group>
                      {carriers.map(carrier => (
                        <CarrierItem
                          key={carrier.carrierId}
                          carrier={carrier}
                          onClick={onItemClick}
                        />
                      ))}
                    </Card.Group>
                  </Grid.Column>

                  <Grid.Column>
                    <Card fluid>
                      <Card.Content>
                        <Checkbox
                          toggle
                          label={t("picking.manifest.checkbox")}
                          checked={printManifest}
                          onChange={onChange}
                        />
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            ) : (
              <Card fluid>
                <Card.Content>
                  <h1>
                    <Trans i18nKey="picking.manifest.no-items" />
                  </h1>
                  <Card.Description>
                    <Trans i18nKey="picking.manifest.no-items-info" />
                  </Card.Description>
                </Card.Content>
              </Card>
            )}
          </Segment>
        </Container>
      </div>

      <PackingFooter />

      <ConfirmComponent
        show={confirmState.show}
        showConfirm={showConfirm}
        onConfirm={onPrintManifest}
        content={
          <Trans
            i18nKey="picking.manifest.modal"
            values={{
              carrierName: confirmState.name,
              count: get(confirmState, "shipmentIds", []).length,
              "yes/no": printManifest ? "yes" : "no"
            }}
          />
        }
      />
    </>
  );
};

export default ShipmentManifest;
