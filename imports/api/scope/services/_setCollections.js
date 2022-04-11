import { AnalysisSimulationV2 } from "../../analysis-simulation/AnalysisSimulationV2";
import { AnalysisSimulationV2Detail } from "../../analysis-simulation/AnalysisSimulationV2-detail";
import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";
import { PriceList } from "/imports/api/pricelists/PriceList";

export function selectScopeCollection(type) {
  switch (type) {
    case "tender":
      return {
        selector: "tenderId",
        collection: Tender,
        detailCollection: TenderDetail
      };
    case "simulation":
      return {
        queryKey: "analysisId", // copy from/to match key
        selector: "analysisId",
        collection: AnalysisSimulationV2,
        detailCollection: AnalysisSimulationV2Detail
      };

    // to copy from:
    case "priceList":
      return {
        selector: "_id",
        collection: PriceList,
        fields: {
          lanes: 1,
          equipments: 1,
          volumes: 1,
          mode: 1
        }
      };
    default:
      throw new Error("not a correct source");
  }
}

export const setCollections = (type, documentId) => {
  switch (type) {
    case "simulation":
      return {
        detailsCollection: AnalysisSimulationV2Detail,
        collection: AnalysisSimulationV2,
        params: {
          documentId,
          type,
          queryKey: "analysisId",
          root: "analysisId",
          fields: { scope: 1, accountId: 1 }
        }
      };
    case "tender":
      return {
        detailsCollection: TenderDetail,
        collection: Tender,
        params: {
          documentId,
          type,
          queryKey: "_id",
          root: "tenderId",
          fields: { scope: 1, accountId: 1 }
        }
      };

    default:
      throw new Error(
        "not a correct source (only simulation and tender have volume data sources)"
      );
  }
};
