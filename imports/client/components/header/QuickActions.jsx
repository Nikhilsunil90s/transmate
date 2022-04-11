import React, { useState, useContext } from "react";
import { useApolloClient } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Menu, List } from "semantic-ui-react";
import LoginContext from "/imports/client/context/loginContext";

import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";
import NewAddressModal from "/imports/client/views/address-overview/components/NewAddressModal.jsx";
import NewPartnerModal from "/imports/client/views/partner-overview/components/NewPartnerModal.jsx";

import { createTender } from "/imports/client/views/tender-overview/utils/creatTenderFn";
import useRoute from "../../router/useRoute";

const ITEMS = {
  shipments: {
    icon: "anchor",
    route: "newShipment"
  },
  tenders: {
    icon: "gavel",
    route: "tenders",
    action: createTender
  },
  partners: {
    icon: "handshake",
    route: "partners",
    modal: NewPartnerModal
  },
  address: {
    icon: "map pin",
    route: "addresses",
    modal: NewAddressModal
  }
};

const DynamicModal = ({ component, ...props }) => {
  if (!component) return null;
  return React.createElement(component, props);
};

export const QuickActionModal = ({ show, showModal, handleModal }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { userId, accountId } = useContext(LoginContext);
  const { goRoute } = useRoute();

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("quickAction.modal.title")}
      body={
        <List
          animated
          link
          items={Object.entries(ITEMS).map(([k, v]) => ({
            key: k,
            onClick: e => {
              e.stopPropagation();
              if (typeof v.action === "function") {
                v.action({ client, t, userId, accountId, goRoute });
              } else if (v.modal) {
                handleModal(v.modal);
              } else {
                goRoute(v.route);
              }
              showModal(false);
            },
            icon: { name: v.icon, size: "large", verticalAlign: "middle", color: "blue" },
            style: { cursor: "pointer" },
            content: (
              <>
                <List.Header>{t(`quickAction.items.${k}.title`)}</List.Header>
                <List.Description>{t(`quickAction.items.${k}.description`)}</List.Description>
              </>
            )
          }))}
        />
      }
      actions={<ModalActionsClose {...{ showModal }} />}
    />
  );
};

const QuickActions = () => {
  const [show, showModal] = useState(false);
  const [dynamicModalState, setDynamicModalState] = useState({ show: true, component: null });
  const showModalM = showM => setDynamicModalState({ ...dynamicModalState, show: showM });

  const handleModal = component => {
    showModal(false); // close quickaction
    setDynamicModalState({ show: true, component });
  };

  return (
    <>
      <Menu.Item
        onClick={() => showModal(true)}
        icon={{ name: "plus circle", color: "blue", size: "large" }}
      />
      <DynamicModal
        show={dynamicModalState.show}
        showModal={showModalM}
        component={dynamicModalState.component}
      />
      <QuickActionModal show={show} showModal={showModal} handleModal={handleModal} />
    </>
  );
};

export default QuickActions;
