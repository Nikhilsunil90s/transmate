import { oPath } from "/imports/utils/functions/path";

// const { utils: XLSXutils } = require("xlsx");
const unwind = require("javascript-unwind");
const dot = require("dot-object");

// eslint-disable-next-line func-names
export const addTabWithData = function({ tabName, data }) {
  // eslint-disable-next-line no-unused-vars
  const { sheetData, merges, colStyles, rowStyles } = data;
  const ws = this.wb.addWorksheet(tabName, {
    properties: { showGridLines: false }
  });
  ws.addRows(sheetData);

  // if (merges) {
  //   this.wb.Sheets[tabName]["!merges"] = merges;
  // }
  // if (colStyles) {
  //   this.wb.Sheets[tabName]["!cols"] = colStyles;
  // }
  // if (rowStyles) {
  //   this.wb.Sheets[tabName]["!rows"] = rowStyles;
  // }
};

export const exportGeneralInfo = ({ doc }) => {
  const sheetData = [
    [null, null, null],
    [null, "General Info", null], // title
    [null, null, null],
    [null, "title", doc.title],
    [null, "carrierId", doc.carrierId],
    [null, "carrier name", doc.carrierName],
    [null, "mode", doc.mode],
    [null, "category", doc.category],
    [null, "type", doc.type],
    [null, "status", doc.status],
    [null, null, null],
    [null, "Validity", null], // title
    [null, null, null],
    [null, "from", doc.validFrom],
    [null, "to", doc.validTo],
    [null, null, null],
    [null, "Info", null], // title
    [null, null, null],
    [null, "lane count", oPath(["doc", "summary", "laneCount"], this)],
    [null, "rate count", oPath(["doc", "summary", "rateCount"], this)],
    [null, "id", doc._id],
    [null, null, null]
  ];

  // colFormatting
  const colCount = sheetData[0].length;
  const colStyles = new Array(colCount).fill({ width: 14 });
  colStyles[0] = { width: 1 };

  // rowFormatting
  const rowCount = sheetData.length;
  const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
  rowStyles[0] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[2] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[12] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[17] = { hpt: 5.4, hpx: 5.4 };

  const merges = [];
  return { sheetData, merges, colStyles, rowStyles };
};

export const exportHistory = ({ updates }) => {
  const sheetData = [
    [null, null, null, null],
    [null, "Updates", null, null], // title
    [null, null, null, null],
    [null, "action", "userId", "date"]
  ];
  updates.forEach(update => {
    sheetData.push([null, update.action, update.userId, update.ts]);
  });

  // colFormatting
  const colCount = sheetData[0].length;
  const colStyles = new Array(colCount).fill({ width: 14 });
  colStyles[0] = { width: 1 };
  colStyles[3] = { width: 24 };

  // rowFormatting
  const rowCount = sheetData.length;
  const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
  rowStyles[0] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[2] = { hpt: 5.4, hpx: 5.4 };

  const merges = [];
  return { sheetData, merges, colStyles, rowStyles };
};

export const exportLanes = ({ lanes }) => {
  const sheetData = [
    [null, null, null, null, null, null, null, null, null, null, null],
    [null, "Lanes", null, null, null, null, null, null, null, null, null], // title
    [null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, "From", null, null, null, "To", null, null, null],
    [
      null,
      "Name",
      "Incoterm",
      "addressId",
      "country",
      "zip-from",
      "zip-to",
      "addressId",
      "country",
      "zip-from",
      "zip-to"
    ]
  ];

  lanes.forEach(lane => {
    // lane is {} -> unwind to []
    // unwind needs [] on first level of object
    dot.transfer("from.addressIds", "fromAddr", lane, lane);
    dot.transfer("from.zones", "fromZones", lane, lane);
    dot.transfer("to.addressIds", "toAddr", lane, lane);
    dot.transfer("to.zones", "toZones", lane, lane);

    let unwoundLane = [lane];
    if (oPath(["fromAddr", "length"], lane) > 0) {
      unwoundLane = unwind(unwoundLane, "fromAddr");
    }
    if (oPath(["fromZones", "length"], lane) > 0) {
      unwoundLane = unwind(unwoundLane, "fromZones");
    }
    if (oPath(["toAddr", "length"], lane) > 0) {
      unwoundLane = unwind(unwoundLane, "toAddr");
    }
    if (oPath(["toZones", "length"], lane) > 0) {
      unwoundLane = unwind(unwoundLane, "toZones");
    }
    unwoundLane.forEach(laneCombi => {
      sheetData.push([
        null,
        laneCombi.name,
        laneCombi.incoterm,
        laneCombi.fromAddr,
        oPath(["fromZones", "CC"], laneCombi),
        oPath(["fromZones", "from"], laneCombi),
        oPath(["fromZones", "to"], laneCombi),
        laneCombi.toAddr,
        oPath(["toZones", "CC"], laneCombi),
        oPath(["toZones", "from"], laneCombi),
        oPath(["toZones", "to"], laneCombi)
      ]);
    });
  });

  // colFormatting
  const colCount = sheetData[0].length;
  const colStyles = new Array(colCount).fill({ width: 12 });
  colStyles[0] = { width: 1 };

  const merges = [];

  // const merges = [
  //   {
  //     s: XLSXutils.encode_cell({
  //       c: 3,
  //       r: 3
  //     }),
  //     e: XLSXutils.encode_cell({
  //       c: 6,
  //       r: 3
  //     })
  //   },
  //   {
  //     s: XLSXutils.encode_cell({
  //       c: 7,
  //       r: 3
  //     }),
  //     e: XLSXutils.encode_cell({
  //       c: 10,
  //       r: 3
  //     })
  //   }
  // ];

  // rowFormatting
  const rowCount = sheetData.length;
  const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
  rowStyles[0] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[2] = { hpt: 5.4, hpx: 5.4 };

  return { sheetData, merges, colStyles, rowStyles };
};

export const exportVolumes = ({ volumes }) => {
  const sheetData = [
    [null, null, null, null, null, null],
    [null, "Volumes", null, null, null, null], // title
    [null, null, null, null, null, null],
    [null, "uom", "SL", "name", "from", "to"]
  ];

  volumes.forEach(vol => {
    vol.ranges = vol.ranges || [];
    let unwoundVolumes = [vol];

    unwoundVolumes = unwind(unwoundVolumes, "ranges");

    unwoundVolumes.forEach(volCombi => {
      sheetData.push([
        null,
        volCombi.uom,
        volCombi.serviceLevel,
        volCombi.ranges.name,
        volCombi.ranges.from,
        volCombi.ranges.to
      ]);
    });
  });

  // colFormatting
  const colCount = sheetData[0].length;
  const colStyles = new Array(colCount).fill({ width: 14 });
  colStyles[0] = { width: 1 };
  colStyles[3] = { width: 20 };

  // rowFormatting
  const rowCount = sheetData.length;
  const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
  rowStyles[0] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[2] = { hpt: 5.4, hpx: 5.4 };

  const merges = [];
  return { sheetData, merges, colStyles, rowStyles };
};

export const exportEquipments = ({ equipments }) => {
  let equipmentsC = equipments;
  const sheetData = [
    [null, null, null],
    [null, "Equipments", null], // title
    [null, null, null],
    [null, "name", "types"]
  ];

  if (oPath(["types", "length"], equipmentsC)) {
    equipmentsC = unwind(equipmentsC, "types");
  }
  equipmentsC.forEach(eq => {
    sheetData.push([null, eq.name, eq.types]);
  });

  // colFormatting
  const colCount = sheetData[0].length;
  const colStyles = new Array(colCount).fill({ width: 14 });
  colStyles[0] = { width: 1 };
  colStyles[1] = { width: 20 };

  // rowFormatting
  const rowCount = sheetData.length;
  const rowStyles = new Array(rowCount).fill({ hpt: 14.4, hpx: 14.4 });
  rowStyles[0] = { hpt: 5.4, hpx: 5.4 };
  rowStyles[2] = { hpt: 5.4, hpx: 5.4 };

  const merges = [];
  return { sheetData, merges, colStyles, rowStyles };
};
