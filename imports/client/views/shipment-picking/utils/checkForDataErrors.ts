const MAX_STREET_LENGTH = 45;
const MAX_NAME_LENGTH = 45;
const MAX_DESCRIPTION_LENGTH = 45;

export const checkForErrors = data => {
  const PU = data.nestedItems.find(({ isPackingUnit }) => isPackingUnit) || {};
  const description =
    PU.commodity || PU.description || PU.quantity?.description || "BOX";
  return {
    streetTooLong:
      data.delivery?.location?.address?.street?.length > MAX_STREET_LENGTH,
    nameTooLong: data.delivery?.location?.name?.length > MAX_NAME_LENGTH,
    itemDescriptionTooLong: description.length > MAX_DESCRIPTION_LENGTH
  };
};
