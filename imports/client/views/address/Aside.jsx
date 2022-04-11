import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import { Segment, Header, Divider, List, Icon } from "semantic-ui-react";

import { AddressFormat, MomentTag } from "/imports/client/components/tags";
import { GET_ASIDE_INFO } from "./utils/queries";
import useRoute from "../../router/useRoute";
import { generateRoutePath } from "../../router/routes-helpers";

const debug = require("debug")("address:UI");

const AddressDetails = () => {
  const { t } = useTranslation();
  const { params } = useRoute();
  const addressId = params._id;
  const { data = {}, loading, error } = useQuery(GET_ASIDE_INFO, {
    variables: { addressId }
  });
  if (error) console.error(error);

  debug("GET_ASIDE_INFO from apollo %o", { data, loading, error });
  const { address, shipments } = data;

  if (loading) return t("general.loading");
  return (
    <Segment padded="very" basic>
      <Header as="h5" content={t("address.form.tab.address")} />
      <div>
        <AddressFormat location={{ address, countryCode: address?.countryCode }} />
      </div>
      <Divider section />
      <Header as="h5" content="Recent shipments" />
      <div>
        <List>
          {shipments &&
            shipments.map(({ id, ...shipment }) => (
              <List.Item key={id}>
                <a href={generateRoutePath("shipment", { _id: id })}>#{shipment.number}</a>
                <span className="right floated meta">
                  <MomentTag date={shipment.created.at} />{" "}
                  <Icon.Group>
                    <Icon name="warehouse" />
                    <Icon
                      corner={shipment.direction === "in" ? "bottom left" : "bottom right"}
                      name="arrow right"
                    />
                  </Icon.Group>
                </span>
              </List.Item>
            ))}
        </List>
      </div>
    </Segment>
  );
};
export default AddressDetails;
