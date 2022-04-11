import { _ } from "meteor/underscore";
import get from "lodash.get";

import { oPath } from "/imports/utils/functions/path";
import { PopData } from "/imports/utils/functions/classDataPop";

import { saveRates } from "/imports/utils/priceList/grid_saveRates";
import { getKeysForCell } from "./grid_helpers";

const debugGrid = require("debug")("price-list:grid");

const contextMenuTitle = (topic, canEdit, t) => {
  if (canEdit) {
    return t(`price.list.${topic}.edit`);
  }
  return t(`price.list.${topic}.view`);
};

const getGridContextMenuComp = (grid, t) => ({
  grid,
  get() {
    return {
      disabled: false,
      items: {
        copy: {},
        rate: {
          name: contextMenuTitle(
            "rate",
            this.grid.security.canEditRateInGrid,
            t
          ),
          hidden: ({ isBody, row, col }) => {
            // hide when not body or base.isHeader
            return !isBody || oPath(["base", row, col, "isHeader"], this.grid);
          },
          disabled: ({ selection }) => {
            // disable if no data is to be shown for the selection
            return !oPath(
              ["0"],
              new PopData(this.grid.base).select(selection).get()
            );
          },
          callback: ({ row, col }) => {
            const rateDetail = get(grid, ["base", row, col]) || {};

            const onSaveAction = ({ update, selector, callback }) => {
              // update item from the UI -> this.grid should be a complete valid rate doc.
              const updates = [
                {
                  selector,
                  update
                }
              ];
              return saveRates.call(
                this.grid,
                {
                  priceListId: this.grid.doc.id,
                  updates
                },
                callback
              );
            };

            return {
              template: "PriceListRateModal",
              title: contextMenuTitle(
                "rate",
                this.grid.security.canEditRateInGrid,
                t
              ),
              priceList: this.grid.doc,
              rate: rateDetail,
              onSave: onSaveAction,
              isLocked: !this.grid.security.canEditRateInGrid, // lock all buttons & controls
              disabled: false // = pop up will not show
            };
          }
        },
        comment: {
          name: contextMenuTitle(
            "comment",
            this.grid.security.canEditRateInGrid,
            t
          ),
          hidden: ({ isBody, row, col }) => {
            // hide when not body or base.isHeader
            return !isBody || oPath(["base", row, col, "isHeader"], this.grid);
          },
          disabled: ({ selection }) => {
            debugGrid("selection", selection);
            return !this.grid.security.canAddGridComments;
          },
          callback: ({ selection }) => {
            if (!this.grid.base) {
              return false;
            }
            const temSelect = new PopData(this.grid.base).select(selection);
            const selectedData = temSelect.filter("isHeader", undefined); // filter out isHeader
            if (!selectedData.getCount()) {
              return false;
            }

            const onSaveAction = ({ update }) => {
              // update -> is what needs to be changed
              const updates = (selectedData.get() || []).map(item => {
                return {
                  selector: { id: item.id },
                  update
                };
              });

              return saveRates.call(this.grid, {
                priceListId: this.grid.doc.id,
                updates
              });
            };

            return {
              template: "PriceListRateModal",
              title: `Editting ${selectedData.getCount()} rate elements`,
              priceList: this.grid.doc,
              rate: selectedData.getCommonData(),
              tab: "comment",
              countEditing: selectedData.getCount(), // when editing multiple elements
              onSave: onSaveAction,
              isLocked: !this.grid.security.canEditRateInGrid, // lock all buttons & controls
              disabled: false // = pop up will not show
            };
          }
        },
        separator: "---------",
        lane: {
          name: contextMenuTitle(
            "lane",
            this.grid.security.canEditLaneInGrid,
            t
          ),
          hidden: ({ isColHeader, isRowHeader, isBody, row, col }) => {
            debugGrid(
              "lane hidden",
              isRowHeader,
              isColHeader,
              isBody,
              row,
              col
            );
            return !(
              (isRowHeader &&
                _.findWhere(this.grid.templInfo.rows, {
                  field: "laneId"
                })) ||
              (isColHeader &&
                _.findWhere(this.grid.templInfo.cols, {
                  field: "laneId"
                }))
            );
          },
          callback: ({ row, col }) => {
            const keys = getKeysForCell.call(this.grid, { row, col });
            const { laneId } = keys;
            const index = (this.grid.doc.lanes || []).findIndex(
              el => el.id === laneId
            );
            return {
              template: "LaneModal",
              lane: this.grid.doc.lanes[index],
              lanes: this.grid.doc.lanes || [],
              index,
              id: laneId,
              onSave: this.grid.onSaveAction,
              isLocked: !this.grid.security.canEditLaneInGrid,
              disabled: false // = pop up will not show
            };
          }
        },
        equipment: {
          name: contextMenuTitle(
            "equipment",
            this.grid.security.canEditEquipmentInGrid,
            t
          ),
          hidden: ({ isColHeader, isRowHeader }) => {
            // hide when clicking in header & topic is not in...
            return !(
              (isRowHeader &&
                _.findWhere(this.grid.templInfo.rows, {
                  field: "equipmentGroupId"
                })) ||
              (isColHeader &&
                _.findWhere(this.grid.templInfo.cols, {
                  field: "equipmentGroupId"
                }))
            );
          },

          // hide when clicking in header that has not the key..
          callback: ({ row, col }) => {
            const keys = getKeysForCell.call(this.grid, { row, col });
            const { equipmentGroupId } = keys;
            const index = (this.grid.doc.equipments || []).findIndex(
              el => el.id === equipmentGroupId
            );
            debugGrid(
              "equipment context menu: %s, index: %s, keysForCell",
              equipmentGroupId,
              index,
              keys
            );
            return {
              template: "EquipmentModal",
              equipment: this.grid.doc.equipments[index],
              equipments: this.grid.doc.equipments,
              index,
              id: equipmentGroupId,
              onSave: this.grid.onSaveAction,
              isLocked: !this.grid.security.canEditEquipmentInGrid, // lock all buttons & controls
              disable: !this.grid.security.canEditEquipmentInGrid
            };
          }
        },
        volume: {
          name: contextMenuTitle(
            "volume",
            this.grid.security.canEditVolumesInGrid,
            t
          ),
          hidden: ({ isColHeader, isRowHeader }) => {
            return !(
              (isRowHeader &&
                _.findWhere(this.grid.templInfo.rows, {
                  field: "volumeRangeId"
                })) ||
              (isColHeader &&
                _.findWhere(this.grid.templInfo.cols, {
                  field: "volumeRangeId"
                }))
            );
          },

          // disabled: => !canEdit
          callback: ({ row, col }) => {
            const keys = getKeysForCell.call(this.grid, { row, col });
            const { volumeGroupId } = keys;
            const volumeGroupIndex = (this.grid.doc.volumes || []).findIndex(
              el => el.id === volumeGroupId
            );

            return {
              template: "VolumeGroupModal",
              index: volumeGroupIndex,
              volumeGroupId,
              volumes: this.grid.doc.volumes,
              volume: this.grid.doc.volumes[volumeGroupIndex],
              onSave: this.grid.onSaveAction,
              isLocked: !this.grid.security.canEditVolumesInGrid, // lock all buttons & controls
              disable: !this.grid.security.canEditVolumesInGrid
            };
          }
        },
        charge: {
          name: contextMenuTitle("charge", this.grid.security.canEditCharge, t),
          hidden: ({ row, col }) => {
            return !(
              oPath(["field"], this.grid.getCellData({ row, col })) === "charge"
            );
          },

          // disabled: => !canEdit
          callback: ({ row, col }) => {
            const ref = this.grid.getCellData({ row, col });
            if (oPath(["field"], ref) === "charge") {
              return {
                template: "PriceListChargeModal",
                charge: this.grid.doc.charges[ref.index],
                charges: this.grid.doc.charges,
                index: ref.index,
                onSave: this.grid.onSaveAction,
                isLocked: !this.grid.security.canEditCharge, // lock all buttons & controls
                disable: !this.grid.security.canEditCharge
              };
            }
            return false;
          }
        }
      }
    };
  }
});

export { getGridContextMenuComp };
