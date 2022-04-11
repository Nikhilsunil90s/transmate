import PropTypes from "prop-types";

const ItemReferenceTag = ({ item }) => {
  const reference = item?.references?.number || item?.number || " - ";
  return reference;
};

ItemReferenceTag.propTypes = {
  item: PropTypes.shape({
    number: PropTypes.string,
    reference: PropTypes.shape({
      number: PropTypes.string
    })
  })
};

export default ItemReferenceTag;
