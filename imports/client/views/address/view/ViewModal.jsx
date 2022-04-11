import React from "react";
import PropTypes from "prop-types";
import AddressViewLoader from "./View";
import { ModalComponent } from "/imports/client/components/modals";

// type checks:
import { LocationType } from "/imports/client/components/tags/LocationTag.proptypes";

const AddressViewModal = ({ show, showModal, ...props }) => {
  return (
    <ModalComponent show={show} showModal={showModal} body={<AddressViewLoader {...props} />} />
  );
};

AddressViewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  addressId: PropTypes.string.isRequired,
  accountId: PropTypes.string,
  location: LocationType
};

export default AddressViewModal;
