import priceLists from "/imports/api/_jsonSchemas/fixtures/data.priceList.json";
import { traverse } from "/imports/api/zz_utils/services/server/loadFixtures/convertJSONdates";

export const dummyProps = {
  priceList: traverse(priceLists[1]),
  security: {
    canEdit: true,
    canModifyGridStructure: true,
    canAddFuelModel: true,
    canModifyLeadTime: true,
    canAddMasterNotes: true,
    canAddAttachment: true,
    canDeleteAttachment: true,
    canBeReleased: true,
    canBeApproved: false,
    canBeSetBackToDraft: false,
    canBeDeactivated: true,
    canBeArchived: true,
    canBeActivated: false,
    canBeDeleted: false,

    canEditRateInGrid: true,
    canEditCurrencyInGrid: true,
    canEditMultiplierInGrid: true,
    canEditLaneInGrid: true,
    canEditEquipmentInGrid: true,
    canEditVolumesInGrid: true,
    canEditCharge: true,
    canAddGridComments: true,
    canFillOut: true,
    canEditRateInList: true
  },
  onSave: (update, cb) => {
    if (cb) cb();
  },
  refetch: () => {}
};
