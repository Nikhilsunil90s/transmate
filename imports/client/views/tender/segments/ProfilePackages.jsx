import React, { useState, useMemo } from "react";
import get from "lodash.get";
import { Trans, useTranslation } from "react-i18next";
import { Popup, Segment, Message, Button, Flag, Header, Icon, Checkbox } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { NumberTag } from "/imports/client/components/tags";
import { Address } from "/imports/api/addresses/Address";

const debug = require("debug")("tenders:UI");

function getPackageUOMs(tender) {
  let uoms = [];
  if (tender?.scope?.volumes) {
    uoms = tender.scope.volumes.map(volume => volume.uom);
  } else if (tender?.scope?.equipments) {
    uoms = ["containers (physical units)"];
  }
  debug("uoms %j", uoms);
  return uoms.join();
}

function zoneFormat(country, zip, locode) {
  let t = "";

  // t += "#{Address.countryName country}"
  t += `${country}`;
  if (zip != null && zip !== "*") {
    t += ` ${zip}`;
  }
  if (locode != null) {
    t += `${locode}`;
  }
  return t;
}

function getPackageIds(packages = []) {
  const ids = [];
  packages.forEach(pkg => {
    (pkg.bidGroups || []).forEach(grp => ids.push(grp.id));
  });
  return ids;
}

/**
 * Packages Section  lists all aggregated bid packages.
 * Requestor sees packages
 * Bidder sees packages and a checkbox to indicate he is bidding on the lanes
 */
const PackagesSection = ({ ...props }) => {
  const { t } = useTranslation();
  const { tender, security = {}, onSaveBid } = props;
  const { canPlaceBid } = security;

  // array of items the bidder has quoted for:
  const allIds = useMemo(() => (canPlaceBid ? getPackageIds(tender.packages) : []), [
    tender.packages
  ]);
  const myBids = canPlaceBid ? get(tender, ["bidders", 0, "bids"]) || [] : [];
  const [bids, setBids] = useState(myBids);
  const [hasBidsToConfirm, setBidsToConfirm] = useState(false);

  function saveMyBids(newBids) {
    onSaveBid("bids", { array: newBids });
    setBidsToConfirm(false);
  }

  function modifyMyBids(id, checked) {
    const curBids = new Set(bids);
    if (checked) {
      curBids.add(id);
    } else {
      curBids.delete(id);
    }
    setBids([...curBids]);
    setBidsToConfirm(true);
  }

  return (
    <Segment padded="very" data-test="packageSection">
      <Message
        floating
        info
        icon="info"
        content={`Volume quantities represent [${getPackageUOMs(tender)}]`}
      />
      {canPlaceBid && (
        <Button.Group size="small" basic floated="right">
          {hasBidsToConfirm && (
            <Button
              data-test="confirmBids"
              primary
              content="Confirm"
              onClick={() => saveMyBids(bids)}
            />
          )}
          <Popup
            content="Select All"
            trigger={
              <Button
                icon="check square outline"
                onClick={() => {
                  setBids(allIds);
                  saveMyBids(allIds);
                }}
              />
            }
          />
          <Popup
            content="Remove All"
            trigger={
              <Button
                icon="eraser"
                onClick={() => {
                  setBids([]);
                  saveMyBids([]);
                }}
              />
            }
          />
        </Button.Group>
      )}
      <h1>
        <Trans i18nKey="tender.profile.lanes" />
      </h1>

      {(tender.packages || []).map((pkg, i) => (
        <ReactTable
          key={`package-${i}`}
          data={pkg.bidGroups || []}
          columns={[
            {
              id: "group1",
              Header: () => (
                <>
                  <Flag name={pkg.pickupCountry.toLowerCase()} />
                  <b>
                    <Trans
                      i18nKey="tender.profile.package.pickup"
                      values={{ country: Address.countryName(pkg.pickupCountry) }}
                    />
                  </b>
                </>
              ),
              columns: [
                {
                  Header: <Trans i18nKey="tender.profile.package.lane" />,
                  className: "six wide column",
                  id: "lane",
                  Cell: ({ row: { original: o } }) => (
                    <>
                      {o.deliveryCountry && <Flag name={o.deliveryCountry.toLowerCase()} />}
                      {zoneFormat(o.deliveryCountry, o.deliveryZip, o.deliveryLocode)}
                      {" (ex "}
                      {zoneFormat(o.pickupCountry, o.pickupZip, o.pickupLocode)}
                      {")"}
                      {o.equipment ? ` ${o.equipment}` : null}
                    </>
                  )
                },
                {
                  Header: `${t("tender.profile.package.shipments")} (B/L) `,
                  className: "two wide column",
                  accessor: "quantity.shipCount",
                  Cell: ({ value }) => <NumberTag value={value} digits={2} />
                }
              ]
            },
            {
              id: "group2",
              Header: () => null,
              columns: [
                {
                  Header: <Trans i18nKey="tender.profile.package.volume.total" />,
                  className: "two wide column",
                  accessor: "quantity.totalAmount",
                  Cell: ({ value }) => <NumberTag value={value} digits={2} />
                },
                {
                  Header: <Trans i18nKey="tender.profile.package.volume.avg" />,
                  className: "two wide column",
                  id: "average",
                  Cell: ({ row: { original: o } }) => {
                    const value = (o.quantity?.totalAmount || 0) / (o.quantity?.shipCount || 1);
                    return <NumberTag value={value} digits={2} />;
                  }
                },
                ...(canPlaceBid
                  ? [
                      {
                        Header: () => null,
                        className: "two wide column",
                        id: "actions",
                        Cell: ({ row: { original: o, index } }) => {
                          return canPlaceBid ? (
                            <Checkbox
                              data-test={`package-${i}-${index}`}
                              checked={bids.includes(o.id)}
                              onClick={(_, { checked }) => modifyMyBids(o.id, checked)}
                            />
                          ) : null;
                        }
                      }
                    ]
                  : [])
              ]
            }
          ]}
        />
      ))}
    </Segment>
  );
};

const PackagesPlaceholder = ({ ...props }) => {
  const { regenerateProfile, security = {} } = props;
  const { canModifyTenderSettings } = security;

  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="magic" />
        No profile has been generated yet
      </Header>

      <Button
        primary
        disabled={!canModifyTenderSettings}
        content="Generate profile"
        onClick={regenerateProfile}
      />
    </Segment>
  );
};

const PackagesSectionAll = ({ ...props }) => {
  const packages = get(props, ["tender", "packages"]) || [];

  return packages.length ? <PackagesSection {...props} /> : <PackagesPlaceholder {...props} />;
};

export default PackagesSectionAll;
