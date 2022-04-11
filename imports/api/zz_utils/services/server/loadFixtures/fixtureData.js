import { Random } from "/imports/utils/functions/random.js";

import moment from "moment";
import { traverse } from "./convertJSONdates";

// allows us to directly access the mongodb driver:
// import { NpmModuleMongodb as MongoDB } from "meteor/npm-mongo";

import { Analysis } from "/imports/api/analysis/Analysis";
import { AnalysisSimulationV2 } from "../../../../analysis-simulation/AnalysisSimulationV2";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { AllAccountsSettings } from "/imports/api/allAccountsSettings/AllAccountsSettings";
import { Address } from "/imports/api/addresses/Address";
import { Shipment } from "/imports/api/shipments/Shipment";
import { ShipmentsView } from "/imports/api/views/ShipmentsView";
import { Stage } from "/imports/api/stages/Stage";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { Location } from "/imports/api/locations/Location";
import { PriceListRate } from "/imports/api/pricelists/PriceListRate";
import { PriceList } from "/imports/api/pricelists/PriceList";
import { PriceListTemplate } from "/imports/api/priceListTemplates/PriceListTemplate";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { Tender } from "/imports/api/tenders/Tender";
import { TenderDetail } from "/imports/api/tenders/TenderDetail";
import { DocTemplate } from "/imports/api/templates/Template";
import { Notification } from "/imports/api/notifications/Notification";
import { Rate } from "/imports/api/rates/Rate";
import { Cost } from "/imports/api/costs/Cost";
import { Document } from "/imports/api/documents/Document";
import { NonConformance } from "/imports/api/nonConformances/NonConformance";
import { ShipmentProject } from "/imports/api/shipmentProject/ShipmentProject";
import { FuelIndex } from "/imports/api/fuel/FuelIndex";
import { Task } from "/imports/api/bpmn-tasks/Task";
import { AccountPortal } from "/imports/api/accountPortal/AccountPortal";
import { Conversation } from "/imports/api/conversations/Conversation";
import { Comments } from "/imports/api/comments/Comments";
import { AnalysisSwitchPoint } from "/imports/api/analysis-switchpoint/AnalysisSwitchPoint";
import { Import } from "/imports/api/imports/Import-shipments.js";
import { Settings } from "/imports/api/settings/Settings";
import { TenderBid } from "/imports/api/tender-bids/TenderBid";
import { TenderBidMapping } from "/imports/api/tender-bids-mapping/TenderBidMapping";
import { TenderBidDataMeta } from "/imports/api/tender-bids-data/TenderBidDataMeta";
import { TenderBidData } from "/imports/api/tender-bids-data/TenderBidData";
import { Invoice } from "/imports/api/invoices/Invoice";
import { InvoiceItem } from "/imports/api/invoices/Invoice-item";
import { RolesAssignment } from "/imports/api/roles/RolesAssignment";
import { Roles } from "/imports/api/roles/Roles";
import { User } from "/imports/api/users/User";
import { EdiRows } from "/imports/api/imports/Import-shipments-rows";
import { EdiJobs } from "/imports/api/jobs/Jobs.ts";

import userFixtures from "/imports/api/_jsonSchemas/fixtures/data.users.json";
import accountFixtures from "/imports/api/_jsonSchemas/fixtures/data.accounts.json";
import roleFixtures from "/imports/api/_jsonSchemas/fixtures/data.roles.json";
import assignmentFixtures from "/imports/api/_jsonSchemas/fixtures/data.roleAssignments.json";
import addressFixtures from "/imports/api/_jsonSchemas/fixtures/data.addresses.json";
import locationFixtures from "/imports/api/_jsonSchemas/fixtures/data.locations.json";
import shipmentFixtures from "/imports/api/_jsonSchemas/fixtures/data.shipments.json";
import shipmentViewFixtures from "/imports/api/_jsonSchemas/fixtures/data.shipments.views.json";
import shipmentItemsFixtures from "/imports/api/_jsonSchemas/fixtures/data.items.json";
import stageFixtures from "/imports/api/_jsonSchemas/fixtures/data.stages.json";
import priceListFixtures from "/imports/api/_jsonSchemas/fixtures/data.priceList.json";
import priceListRateFixtures from "/imports/api/_jsonSchemas/fixtures/data.priceListRate.json";
import tenderFixtures from "/imports/api/_jsonSchemas/fixtures/data.tender.json";
import tenderDetailFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderDetails.json";
import priceRequestFixtures from "/imports/api/_jsonSchemas/fixtures/data.priceRequests.json";
import priceListTemplateFixtures from "/imports/api/_jsonSchemas/fixtures/data.priceListTemplates.json";
import analysisFixtures from "/imports/api/_jsonSchemas/fixtures/data.analysis.json";
import analysisSimulationFixtures from "/imports/api/_jsonSchemas/fixtures/data.analysisSimulation.json";
import templateFixtures from "/imports/api/_jsonSchemas/fixtures/data.templates.json";
import notificationsFixtures from "/imports/api/_jsonSchemas/fixtures/data.notifications.json";
import accountsSettingsFixtures from "/imports/api/_jsonSchemas/fixtures/data.accounts.settings.json";
import ratesFixtures from "/imports/api/_jsonSchemas/fixtures/data.rates.json";
import costsFixtures from "/imports/api/_jsonSchemas/fixtures/data.costs.json";
import documentFixtures from "/imports/api/_jsonSchemas/fixtures/data.documents.json";
import nonConformancesFixtures from "/imports/api/_jsonSchemas/fixtures/data.nonConformances.json";
import shipmentProjectFixtures from "/imports/api/_jsonSchemas/fixtures/data.shipmentProjects.json";
import fuelFixtures from "/imports/api/_jsonSchemas/fixtures/data.fuel.json";
import BPMNTaskFixtures from "/imports/api/_jsonSchemas/fixtures/data.BPMNtasks.json";
import AccountPortalFixtures from "/imports/api/_jsonSchemas/fixtures/data.accountPortal.json";
import ConversationFixtures from "/imports/api/_jsonSchemas/fixtures/data.conversations.json";
import CommentsFixtures from "/imports/api/_jsonSchemas/fixtures/data.comments.json";
import SwitchPointFixtures from "/imports/api/_jsonSchemas/fixtures/data.analysisSwitchPoint.json";
import ShipmentImportFixtures from "/imports/api/_jsonSchemas/fixtures/data.shipmentImport.json";
import SettingsFixtures from "/imports/api/_jsonSchemas/fixtures/data.settings.json";
import TenderBidFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.json";
import TenderBidMappingFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.mapping.json";
import TenderBidMetaFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.data.meta.json";
import TenderBidDataFixtures from "/imports/api/_jsonSchemas/fixtures/data.tenderify.data.json";
import InvoiceFixtures from "/imports/api/_jsonSchemas/fixtures/data.invoices.json";
import InvoiceItemFixtures from "/imports/api/_jsonSchemas/fixtures/data.invoiceItems.json";
import EdiRowsFixtures from "/imports/api/_jsonSchemas/fixtures/data.ediRows.json";
import EdiJobsFixtures from "/imports/api/_jsonSchemas/fixtures/data.jobs.edi.new.json";

const debug = require("debug")("loadFixtures");
// eslint-disable-next-line new-cap
// debug(MongoDB.Collection("migrations").find());

function randomDate() {
  // get a date from the last 60 days
  const days = 60;
  const newDate = new Date(
    new Date().getTime() - Math.random() * 1000 * 60 * 60 * 24 * days
  );
  debug("random date used:", newDate);
  return newDate;
}

export const getCollectionMap = () => {
  return {
    users: {
      collection: User._collection,
      fixtures: userFixtures
    },
    accounts: {
      collection: AllAccounts._collection,
      fixtures: accountFixtures
    },
    accountSettings: {
      collection: AllAccountsSettings._collection,
      fixtures: accountsSettingsFixtures
    },
    analysis: {
      collection: Analysis._collection,
      fixtures: analysisFixtures
    },
    analysisSimulation: {
      collection: AnalysisSimulationV2._collection,
      fixtures: analysisSimulationFixtures
    },
    costs: {
      collection: Cost._collection,
      fixtures: costsFixtures
    },
    shipments: {
      collection: Shipment._collection,
      fixtures: shipmentFixtures,
      mods: [
        {
          updated: {
            by: "server",
            at: randomDate() // needed for overview to work (only last x days)
          }
        }
      ]
    },
    shipmentsViews: {
      collection: ShipmentsView._collection,
      fixtures: shipmentViewFixtures
    },
    stages: {
      collection: Stage._collection,
      fixtures: stageFixtures
    },
    documents: {
      collection: Document._collection,
      fixtures: documentFixtures
    },
    items: {
      collection: ShipmentItem._collection,
      fixtures: shipmentItemsFixtures
    },

    roles: {
      collection: Roles._collection,
      fixtures: roleFixtures
    },
    roleAssingments: {
      collection: RolesAssignment,
      fixtures: assignmentFixtures
    },
    addresses: {
      collection: Address._collection,
      fixtures: addressFixtures
    },
    locations: {
      collection: Location._collection,
      fixtures: locationFixtures
    },
    notifications: {
      collection: Notification._collection,
      fixtures: notificationsFixtures,
      mods: [
        {
          created: moment()
            .subtract(1, "days")
            .toDate()
        }
      ]
    },
    priceLists: {
      collection: PriceList._collection,
      fixtures: priceListFixtures,
      mods: [
        {
          validTo: moment()
            .add(1, "year")
            .toDate()
        }
      ]
    },
    priceListRates: {
      collection: PriceListRate._collection,
      fixtures: priceListRateFixtures
    },
    priceRequests: {
      collection: PriceRequest._collection,
      fixtures: priceRequestFixtures,
      mods: [
        {
          dueDate: moment()
            .add(1, "days")
            .toDate()
        }
      ]
    },
    priceListTemplates: {
      collection: PriceListTemplate._collection,
      fixtures: priceListTemplateFixtures
    },
    tenders: {
      collection: Tender._collection,
      fixtures: tenderFixtures
    },
    tenderDetails: {
      collection: TenderDetail._collection,
      fixtures: tenderDetailFixtures
    },
    nonConformances: {
      collection: NonConformance._collection,
      fixtures: nonConformancesFixtures
    },
    rates: {
      collection: Rate._collection,
      fixtures: ratesFixtures
    },

    templates: {
      collection: DocTemplate._collection,
      fixtures: templateFixtures
    },
    projects: {
      collection: ShipmentProject._collection,
      fixtures: shipmentProjectFixtures
    },
    fuel: {
      collection: FuelIndex._collection,
      fixtures: fuelFixtures
    },
    tasks: {
      collection: Task._collection,
      fixtures: BPMNTaskFixtures
    },
    accountPortal: {
      collection: AccountPortal._collection,
      fixtures: AccountPortalFixtures
    },
    conversations: {
      collection: Conversation._collection,
      fixtures: ConversationFixtures
    },
    comments: {
      collection: Comments._collection,
      fixtures: CommentsFixtures
    },
    switchPoint: {
      collection: AnalysisSwitchPoint._collection,
      fixtures: SwitchPointFixtures
    },
    shipmentImport: {
      collection: Import._collection,
      fixtures: ShipmentImportFixtures
    },
    shipmentImportRows: {
      collection: EdiRows,
      fixtures: EdiRowsFixtures
    },
    settings: {
      collection: Settings._collection,
      fixtures: SettingsFixtures
    },
    tenderBid: {
      collection: TenderBid._collection,
      fixtures: TenderBidFixtures
    },
    tenderBidMapping: {
      collection: TenderBidMapping._collection,
      fixtures: TenderBidMappingFixtures
    },
    tenderBidData: {
      collection: TenderBidData._collection,
      fixtures: TenderBidDataFixtures,
      addExtraLines: process.env.FIXTURES_EXTRA_LINES_TENDER_BIDS || 0,
      mods: [{ lineId: () => Random.id() }]
    },
    tenderBidMeta: {
      collection: TenderBidDataMeta._collection,
      fixtures: TenderBidMetaFixtures
    },
    invoices: {
      collection: Invoice._collection,
      fixtures: InvoiceFixtures
    },
    invoiceItems: {
      collection: InvoiceItem._collection,
      fixtures: InvoiceItemFixtures
    },
    ediJobs: {
      collection: EdiJobs._collection,
      fixtures: EdiJobsFixtures
    }
  };
};

// converts $date to a real date

export const cleanFixtureData = (fixtures = []) => {
  return fixtures.map(item => traverse(item));
};

export const modFixtureData = (fixtures = [], mods = []) => {
  debug("apply mods", mods);
  let modFixtures = fixtures;
  mods.forEach(mod => {
    Object.keys(mod).forEach(k => {
      modFixtures = modFixtures.map(fixture => {
        let mv = mod[k];
        if (typeof mv === "function") {
          mv = mv();
        }
        return {
          ...fixture,
          [k]: mv
        };
      });
    });
  });
  return modFixtures;
};

export const generateMoreLines = (fixtures = [], nExtra = 0) => {
  const extra = Array(Number(nExtra))
    .fill()
    .map(() => fixtures[0]);
  return fixtures.concat(extra);
};
