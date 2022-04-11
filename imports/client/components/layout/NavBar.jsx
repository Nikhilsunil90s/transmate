import { useTranslation, Trans } from "react-i18next";
import React from "react";
import { Menu, Popup } from "semantic-ui-react";
import classNames from "classnames";
import PropTypes from "prop-types";
import useRoute from "../../router/useRoute";
import { generateRoutePath } from "../../router/routes-helpers";

const debug = require("debug")("navbar");

const menu = {
  shipment: {
    routes: [
      "shipments",
      "shipment",
      "projects",
      "newShipment",
      "newShipmentNext",
      "shipmentsView",
      "import"
    ],
    feature: "shipment",
    icon: "icon-compass",
    path: "shipments",
    label: "tab.shipments",
    items: {
      shipmentProjects: {
        label: "tab.projects",
        path: "projects",
        feature: "shipmentProjects"
      },
      picking: {
        label: "tab.picking",
        path: "pickingOverview",
        feature: "shipmentPicking",
        userRole: "core-shipment-picking"
      }
    }
  },
  partner: {
    routes: ["partners", "partner", "invoice", "invoice-overview", "partnerImport", "directory"],
    feature: "partner",
    label: "tab.partners",
    icon: "icon-notebook",
    path: "partners",
    items: {
      invoice: {
        label: "tab.invoice",
        path: "invoice-overview",
        feature: "invoice-check"
      }
    }
  },
  location: {
    routes: ["locations", "addresses", "address", "addressImport"],
    label: "tab.addresses",
    feature: "location",
    icon: "icon-location-pin",
    path: "addresses"
  },
  "price-list": {
    routes: [
      "priceLists",
      "newPriceList",
      "requestPriceList",
      "priceList",
      "editPriceList",
      "viewPriceList",
      "priceLookup"
    ],
    feature: "price-list",
    label: "tab.priceLists",
    icon: "icon-layers",
    path: "priceLists"
  },
  "price-analysis": {
    feature: "price-analysis",
    routes: ["analyses", "analysis"],
    path: "analyses",
    label: "tab.analysis",
    icon: "icon-calculator"
  },
  tender: {
    feature: "tender",
    routes: [
      "tenders",
      "tender",
      "newTender",
      "priceRequests",
      "priceRequestEdit",
      "priceRequestNew"
    ],
    path: "tenders",
    label: "tab.tender",
    icon: "icon-badge",
    items: {
      priceRequests: {
        label: "tab.priceRequests",
        path: "priceRequests",
        feature: "tender"
      }
    }
  },

  tenderify: {
    feature: "tenderify",
    routes: ["bid-overview", "bid"],
    path: "bid-overview",
    label: "tab.bid",
    icon: "icon-briefcase"
  },
  reporting: {
    feature: "reporting",
    routes: ["reporting"],
    path: "reporting",
    label: "tab.dashboard",
    icon: "icon-pie-chart"
  }
};

const translate = tKey => <Trans i18nKey={tKey} />;

const NavBar = ({ activeRoute, accountFeatures = [], userRoles = [] }) => {
  const { t } = useTranslation();
  const hasFeature = feature => accountFeatures.includes(feature);
  const hasRole = role => userRoles.includes(role);
  const isItemActive = item => menu[item].routes.includes(activeRoute);
  debug("userroles %o", userRoles?.length);
  const { goRoute } = useRoute();

  return (
    <Menu as="nav" vertical fixed="left" inverted className="purple">
      {Object.entries(menu)
        .filter(([key]) => hasFeature(key))
        .map(([key, item]) => {
          const subItems = Object.entries(item.items || {})
            .filter(([, { feature }]) => hasFeature(feature))
            .filter(([, { userRole }]) => !userRole || hasRole(userRole))
            .map(([sKey, sItem]) => ({ key: sKey, ...sItem }));

          const hasSubItems = subItems.length > 0;
          return (
            <Popup
              key={key}
              inverted
              position="right center"
              content={t(item.label)}
              disabled={hasSubItems}
              trigger={
                <Menu.Item
                  as="a"
                  href={generateRoutePath(item.path)}
                  name={key}
                  className={classNames({ active: isItemActive(key), dropdown: hasSubItems })}
                  onClick={event => {
                    debug("item.path %o", item.path);
                    goRoute(item.path);
                    event.stopPropagation();
                    event.preventDefault();
                  }}
                >
                  <i className={item.icon} />
                  {hasSubItems && [
                    <i key="icon" className="icon-options-vertical submenu-icon" />,
                    <div key="subMenu" className="menu">
                      <div className="dropdown-menu">
                        {[{ key, ...item }, ...subItems].map(({ key: sKey, ...sItem }) => (
                          <div
                            key={`sItem.${sKey}`}
                            href={generateRoutePath(sItem.path)}
                            className="item dropdown-menu--item"
                            onClick={event => {
                              debug("sItem.path %o", sItem.path);
                              goRoute(sItem.path);
                              event.stopPropagation();
                              event.preventDefault();
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {translate(sItem.label)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ]}
                </Menu.Item>
              }
            />
          );
        })}
      <Popup
        content={t("tab.support")}
        trigger={
          <Menu.Item
            as="a"
            className="support"
            href="https://www.transmate.eu/support/helpdesk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="icon-support" />
          </Menu.Item>
        }
      />
    </Menu>
  );
};

NavBar.propTypes = {
  activeRoute: PropTypes.string.isRequired,
  accountFeatures: PropTypes.array
};

export default NavBar;
