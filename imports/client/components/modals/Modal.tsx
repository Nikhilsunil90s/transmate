/* eslint-disable react-hooks/rules-of-hooks */
import React, { ReactNode, useState } from "react";
import { Modal, ModalProps } from "semantic-ui-react";
import { ModalActionsClose } from "./modalActions";

// const debug = require("debug")("modal:default");

const rootEl = document.getElementById("react-root");

// eslint-disable-next-line no-undef
interface ModalType extends Pick<ModalProps, "size" | "trigger"> {
  show: boolean;
  showModal: (show: boolean) => void;
  title?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  scrolling?: boolean;
}

export const ModalComponent = ({
  show,
  showModal,
  size = "small",
  title,
  body,
  actions,
  trigger,
  scrolling,
  ...props
}: ModalType) => {
  // debug("Modal component called");
  return (
    <>
      <Modal
        data-test="modal"
        dimmer
        open={show}
        onClose={() => showModal(false)}
        trigger={trigger}
        size={size}
        mountNode={rootEl}
        {...props}
      >
        {title && <Modal.Header>{title}</Modal.Header>}
        <Modal.Content scrolling={scrolling}>{body}</Modal.Content>
        <Modal.Actions>
          {actions || <ModalActionsClose showModal={showModal} />}
        </Modal.Actions>
      </Modal>
    </>
  );
};

const initializeModal = () => {
  const [show, setShowModal] = useState(false);

  const showModal = val => setShowModal(val);

  return {
    showModal,
    ModalTrigger: ({ title, body, actions, children: triggerBtn }) => {
      const trigger = React.cloneElement(triggerBtn, {
        onClick: () => showModal(true)
      });
      return (
        <ModalComponent
          {...{ show, showModal, title, body, actions, trigger }}
        />
      );
    },
    Modal: ({ ...props }: ModalType) => <ModalComponent {...props} />
  };
};

export default initializeModal;
