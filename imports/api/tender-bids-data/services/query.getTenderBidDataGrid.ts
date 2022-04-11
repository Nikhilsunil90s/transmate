import { TenderBidDataMeta } from "../TenderBidDataMeta";
import { TenderBidData } from "../TenderBidData";

import { fnContext } from "../../_interfaces/context";
import { DEFAULT_CURRENCY } from "../../_jsonSchemas/enums/costs";
import { AGFilterToQuery, AGFilterModelItemMap } from "./AGFilterToQuery";

const ITEM_LIMIT = 2000;

interface RangeParams {
  start: number;
  limit: number;
}

interface GetProps {
  range?: RangeParams;
}
interface InitProps {
  tenderBidId: string;
  query?: any;
  filters?: AGFilterModelItemMap[];
}

interface HeaderDefObject {
  amount: {
    value: number;
    currency?: string;
  };
  formula?: string;
  tooltip?: string;
}

interface GetTenderBidDataResponse {
  id: string;
  data: Array<any>;
  stats: {
    totalCount: number;
    queryCount: number;
    curCount: number;
  };
  headerDefs: Array<HeaderDefObject | string>;
}

interface ProjectedDataItem {
  lineId: string;
  rowData: Object;
}

interface GetTenderBidDataGrid {
  context: fnContext;
  tenderBidId?: string;
  meta?: any;
  data?: Array<any>;
  projectedData?: Array<ProjectedDataItem>;
  headerDefs?: Array<HeaderDefObject | string>;
  init: (a: InitProps) => Promise<GetTenderBidDataGrid>;

  /** Will construct the headerDefs based on the meta table.
   * wil go through colHeaders, chargesDescriptionsSorted, calculationHeaders & statistics columns
   * @returns this
   */
  convertToStructure: () => GetTenderBidDataGrid;

  /**
   * Will project the fields according to the headerDefs calculated in the convertToStructure() step
   * static cells: return string
   * fillOutCells: return {currency, value, formula}
   * calculation cells: return {currency, value, formula}
   * statistic cells: return {value, unit} | number
   */
  getRowData: (a: GetProps) => Promise<GetTenderBidDataGrid>;
  getUIResponse: () => GetTenderBidDataResponse;
}

export const getTenderBidDataGrid: (a: fnContext) => GetTenderBidDataGrid = ({
  accountId,
  userId
}) => ({
  context: { accountId, userId },
  tenderBidId: null,
  meta: {},
  data: [],
  query: {},
  totalCount: 0,
  tenderBidCurrency: DEFAULT_CURRENCY,
  headerDefs: [],
  projectedData: [],
  async init({ tenderBidId, query = {}, filters = [] }) {
    this.tenderBidId = tenderBidId;
    this.query = { ...AGFilterToQuery(filters), ...query };

    const [meta, totalCount] = await Promise.all([
      TenderBidDataMeta.first(
        { tenderBidId },
        {
          fields: {
            chargeDescriptionsSorted: 1,
            colHeaders: 1,
            calculationHeaders: 1
          }
        }
      ),
      TenderBidData.count({ tenderBidId, ...this.query })
    ]);

    this.meta = meta || {};
    this.totalCount = totalCount;

    // this.tenderBidCurrency; // FIXME => get it from the tenderBid Doc
    return this;
  },

  convertToStructure() {
    this.headerDefs = [
      ...(this.meta.colHeaders || []).map(
        ({ label, edit, k, group, dataKey, isFoldKey }) => ({
          group,
          cType: "col",
          label,
          edit,
          dataKey: dataKey || `${k}.mapping`,
          key: k,
          cKey: k,
          isFoldKey
        })
      ),

      ...(this.meta.chargeDescriptionsSorted || []).map(
        ({ key, dataKey, k, leg, label }) => ({
          // ...mappingKeys.find(rf => rf.k === colData.k), // in client
          label,
          key: k,
          cKey: key, // key that will be used to present data

          // key used to get the data
          dataKey: dataKey ? `${key}.${dataKey}` : key,
          isFillout: !dataKey,
          cType: "fillOut",
          group: `right-${leg}`
        })
      ),

      // calculation (from reference price list generates thes cols)
      ...(this.meta.calculationHeaders || [])
        .filter(({ type }) => type === "charge")
        .map(({ label, leg, name }) => ({
          // ...mappingKeys.find(rf => rf.k === colData.k), // in client
          label,
          key: `calc/${leg}/${name}`,
          cKey: `calc/${leg}/${name}`, // used in frontend to get the data
          dataKey: `calculation.${leg}.${name}`, // used when updating again
          cType: "calculationCharge",
          group: "calculation"
        })),

      ...(this.meta.calculationHeaders || [])
        .filter(({ type }) => type === "manualCharge")
        .map(({ label, name }) => ({
          // ...mappingKeys.find(rf => rf.k === colData.k), // in client
          label,
          key: `calc/${name}`,
          cKey: `calc/${name}`, // used in frontend to get the data
          dataKey: `calculation.manual.${name}`, // used when updating again -> {value, formula}
          cType: "calculationField",
          group: "calculation"
        })),

      // calculation parameters such as conversions or other cells
      ...(this.meta.calculationHeaders || [])
        .filter(({ type }) => !["charge", "manualCharge"].includes(type))
        .map(({ label, k, key }) => ({
          // ...mappingKeys.find(rf => rf.k === colData.k), // in client
          label,
          key: k,
          cKey: key, // FIXME >> store the conversions as {value, formula}
          dataKey: k,
          cType: "calculationField",
          group: "calculation"
        })),

      // FIXME: redo this
      ...[
        ["avgCost", "avg"],
        ["totalRevenue", "sum"],
        ["allocation", "avg", true],
        ["allocatedRevenue", "sum"]
      ].map(([key, aggFunc, editable]) => ({
        dataKey: `statistics.${key}`,
        key,
        cKey: key,
        group: "statistics",
        cType: "statistics",
        edit: Boolean(editable),
        aggFunc
      }))
    ];

    return this;
  },

  async getRowData({ range }) {
    const pagenationPipeLine = [];
    const limit = range?.limit || ITEM_LIMIT;
    if (range) {
      const { start } = range;
      pagenationPipeLine.push({ $skip: start });
    }

    this.projectedData = await TenderBidData._collection.aggregate([
      {
        $match: {
          tenderBidId: this.tenderBidId,
          skipInUBS: { $ne: true },
          ...this.query
        }
      },
      ...pagenationPipeLine,
      { $limit: limit },
      {
        $project: {
          _id: 0,
          lineId: 1,
          tenderBidId: 1,

          // directly project all values:
          ...this.headerDefs.reduce(
            (acc, { cKey, key, dataKey, cType, isFillout }) => {
              const tgtKey = `rowData.${cKey || key}`;
              if (cType === "calculationCharge") {
                acc[`${tgtKey}.amount.value`] = `$${dataKey}.amount.value`;
                acc[
                  `${tgtKey}.amount.currency`
                ] = `$${dataKey}.amount.currency`;
                acc[`${tgtKey}.tooltip`] = `$${dataKey}.rate.tooltip`;
                return acc;
              }
              if (cType === "fillOut" && isFillout) {
                acc[
                  `${tgtKey}.amount.value`
                ] = `$${dataKey}.chargeValue.mapping`;
                acc[`${tgtKey}.amount.currency`] = {
                  $ifNull: [
                    `$${dataKey}.chargeCurrency.mapping`,
                    this.tenderBidCurrency
                  ]
                };
                acc[`${tgtKey}.formula`] = `$${dataKey}.chargeValue.formula`;
                return acc;
              }

              acc[tgtKey] = `$${dataKey}`;
              return acc;
            },
            {}
          )
        }
      }
    ]);
    return this;
  },

  getUIResponse() {
    return {
      id: this.tenderBidId,
      data: this.projectedData,
      stats: {
        totalCount: this.totalCount, // all items independent of filter
        queryCount: 0, // ignore the limit
        curCount: 0 // todo
      },
      headerDefs: this.headerDefs
    };
  }
});
