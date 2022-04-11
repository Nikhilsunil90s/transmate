/* eslint-disable consistent-return */
import get from "lodash.get";
import { _ } from "meteor/underscore";
import { oPath } from "/imports/utils/functions/path";
import { rangeFormatter } from "/imports/utils/priceList/fnPriceListHelpers";
import isEqual from "lodash.isequal";

import { formatter } from "/imports/utils/priceList/fn/priceListFormatter";

// can make this smarter: if no stop and from == locationID -> locationId...
const getStop = (lane, stop) => {
  const stopData = (lane.stops || []).find(({ type }) => type === stop);
  return stopData?.locationId;
};

const parseHeader = ({ doc, params }, t = k => k) => ({
  doc,
  params,
  t,
  getLanes() {
    return (this.doc.lanes || [{}])
      .filter(() => {
        return !get(this, ["params", "lanes"]);
      })
      .map(lane => {
        return {
          keys: {
            laneId: lane.id
          },
          label: lane.name,
          fieldName: this.t("price.list.lane.title"),
          field: "laneId",
          key: lane.id,
          info: {
            fromCC: get(lane, ["from", "zones", 0, "CC"]),
            toCC: get(lane, ["to", "zones", 0, "CC"]),
            portOfLoading: getStop(lane, "portOfLoading"),
            portOfDischarge: getStop(lane, "portOfDischarge"),
            incoterm: lane.incoterm
          }
        };
      });
  },
  getVolumeGroups() {
    return (this.doc.volumes || [{}])
      .filter(group => {
        const filter = this.params.volumeGroupId;
        if (filter) {
          return group.id === filter;
        }
        return !!group.id;
      })
      .map(group => {
        return {
          keys: {
            volumeGroupId: group.id
          },
          label: group.name || `${group.serviceLevel} [${group.uom}]`,
          fieldName: this.t("price.list.volume.group.title"),
          field: "volumeGroupId",
          key: group.id
        };
      });
  },
  getVolumeRanges() {
    const volumes = [];
    if (isEqual(this.doc.volumes, [])) {
      this.doc.volumes = [{}];
    }

    (this.doc.volumes || [{}])
      .filter(group => {
        const filter = this.params.volumeGroupId;
        if (filter) {
          return group.id === filter;
        }
        return true;
      })
      .forEach(group => {
        if (group.ranges != null) {
          return group.ranges.forEach(range => {
            return volumes.push({
              keys: {
                volumeGroupId: group.id, // keep this in, in case it is not set anywhere else..
                volumeRangeId: range.id
              },
              label: range.name || rangeFormatter(range.from, range.to),
              fieldName: this.t("price.list.volume.ranges"),
              field: "volumeRangeId",
              key: range.id,
              multiplier: range.multiplier
            });
          });
        }
        return volumes.push({});
      });
    return volumes;
  },
  getEquipments() {
    const equipment = (this.doc.equipments || [{}])
      // eslint-disable-next-line array-callback-return
      .filter(group => {
        let curFilter;
        const filter = oPath(["params", "equipments"], this);
        if (filter) {
          curFilter = filter.equipmentGroupId;
          if (curFilter) {
            return group.id === curFilter;
          }
        } else {
          return true;
        }
      })
      .map(group => ({
        keys: {
          equipmentGroupId: group.id
        },
        label: group.name,
        fieldName: this.t("price.list.equipment.title"),
        field: "equipmentGroupId",
        key: group.id
      }));
    return equipment;
  },
  getShipments() {
    return (this.doc.shipments || [{}]).map(
      ({ shipmentId, reference, params: costParams }) => ({
        keys: { shipmentId },
        label: reference || "Shipment",
        fieldName: this.t("price.list.shipment.title"),
        field: "shipmentId",
        key: shipmentId,

        // all shipment cost params for the spot requests for further lookup
        costParams: {
          fromCC: oPath(["from", "countryCode"], costParams),
          fromZone: oPath(["from", "zipCode"], costParams),
          toCC: oPath(["to", "countryCode"], costParams),
          toZone: oPath(["to", "zipCode"], costParams),
          goods: formatter.goods(oPath(["goods", "quantity"], costParams)),
          equipments: formatter.equipments(oPath(["equipments"], costParams))
        }
      })
    );
  },
  getCharges() {
    const charges = (this.doc.charges || [{}])
      .map((el, i) => {
        return Object.assign(el, { index: i });
      })
      // eslint-disable-next-line array-callback-return
      .filter(el => {
        let curFilter;
        const filter = oPath(["params", "costs"], this);
        if (filter) {
          curFilter = filter.chargeId;
          if (curFilter) {
            return el.id === curFilter;
          }
        } else {
          return true;
        }
      })
      .map(el => {
        return Object.assign(el, {
          label: el.name,
          field: "charge",
          fieldName: this.t("price.list.charge.title"),
          keysUI: { chargeId: el.id } // not a real key, but one for the UI
        });
      });
    return charges;
  },
  getMultipliers() {
    return [
      {
        // load after unwinding options...
        field: "multiplier",
        fieldName: this.t("price.list.rate.multiplier"),
        fieldType: "attr",
        defaultValue: "shipment", // keep value and label out...
        type: "dropdown"
      }
    ];
  },
  getCurrency() {
    return [
      {
        field: "amount.unit",
        fieldName: this.t("price.list.rate.currency"),
        fieldType: "attr",
        defaultValue: "EUR", // keep value and label out...
        type: "dropdown"
      }
    ];
  },
  getComments() {
    return [
      {
        field: "comment",
        fieldName: this.t("price.list.rate.comment"),
        fieldType: "attr"
      }
    ];
  },

  isEmpty() {
    // if there is no structural element set in the priceList Document this should return true
    const totalItems =
      (this.doc.lanes || []).length +
      (this.doc.equipments || []).length +
      (this.doc.charges || []).length;

    if (!totalItems && this.doc.volumes && this.doc.volumes.length) {
      this.doc.volumes.forEach(v => {
        // eslint-disable-next-line no-unused-expressions
        totalItems + (_.isEmpty(v) ? 0 : 1);
      });
    }

    return totalItems === 0;
  }
});

export { parseHeader };
