import React, { useContext } from "react";
import get from "lodash.get";
import PropTypes from "prop-types";

import { Icon } from "semantic-ui-react";

import PriceRequestDataSingle from "./Data-single.jsx";
import PriceRequestBiddingSimple from "./BiddingSimpleLoader";
import { ReactTable } from "/imports/client/components/tables";
import {
  PartnerTag,
  LocationSummaryTag,
  DateTimeTZtoggleTag,
  DEFAULT_DATE_FORMAT_OPTIONS
} from "/imports/client/components/tags";
import { ItemReferenceTag } from "../components";
import {
  getBidsForAccount,
  getBidForItem,
  countBidDataForItem,
  getWinningBidderForItem
} from "../utils/getBidData";

import { tabPropTypes } from "../tabs/_tabProptypes";
import LoginContext from "/imports/client/context/loginContext.js";

const debug = require("debug")("price-request:dataOverview");

const PriceRequestDataOverview = ({ ...props }) => {
  const {
    loading,
    items = [],
    priceRequest,
    setActiveShipmentId,
    bidtracker,
    isBidder,
    isOwner
  } = props;
  const { accountId } = useContext(LoginContext);
  const { bidders = [] } = priceRequest; // projected according to access level

  let columns = [
    {
      Header: () => "",
      id: "expander",
      Cell: ({ row }) => {
        const { onClick, ...toggleProps } = row.getToggleRowExpandedProps();
        const toggle = e => {
          e.stopPropagation();
          onClick();
        };

        return (
          <span onClick={toggle} {...toggleProps}>
            {row.isExpanded ? <Icon name="caret down" /> : <Icon name="caret right" />}
          </span>
        );
      }
    },
    {
      Header: () => "From",
      accessor: "pickup", // returns {}
      columns: [
        {
          Header: () => "location",
          accessor: "pickup.location",
          Cell: ({ value }) => (value ? <LocationSummaryTag location={value} /> : null)
        },
        {
          Header: () => "date",
          accessor: "pickup", // {}
          Cell: ({ value = {} }) =>
            value.date ? (
              <DateTimeTZtoggleTag
                date={value.datePlanned || value.date}
                locationTZ={value.location?.timeZone}
                options={{ ...DEFAULT_DATE_FORMAT_OPTIONS, weekday: "short" }}
              />
            ) : null
        }
      ]
    },
    {
      Header: () => "To",
      accessor: "delivery", // returns {}
      columns: [
        {
          Header: () => "location",
          accessor: "delivery.location",
          Cell: ({ value }) => (value ? <LocationSummaryTag location={value} /> : null)
        },
        {
          Header: () => "date",
          accessor: "delivery", // {}
          Cell: ({ value = {} }) =>
            value.date ? (
              <DateTimeTZtoggleTag
                date={value.datePlanned || value.date}
                locationTZ={value.location?.timeZone}
                options={{ ...DEFAULT_DATE_FORMAT_OPTIONS, weekday: "short" }}
              />
            ) : null
        }
      ]
    },
    {
      Header: () => "Reference",
      id: "reference",
      sortable: true,
      sortType: (row1, row2) => {
        return (
          get(row1, "original.references.number") ||
          get(row1, "original.number") ||
          "-"
        ).localeCompare(
          get(row2, "original.references.number") || get(row2, "original.number") || "-"
        );
      },
      Cell: ({ row }) => <ItemReferenceTag item={row.original} />
    }
  ];

  if (isBidder) {
    const mySimpleBids = getBidsForAccount({ bidders, accountId });
    columns = [
      ...columns,
      {
        Header: () => "offered",
        id: "hasOffered",
        className: "center aligned",
        Cell: ({ row }) => {
          const bid = getBidForItem({ bids: mySimpleBids, shipmentId: row.original.id });
          return <Icon name={!bid || bid?.offered === false ? "close" : "check"} />;
        },
        setStyle: row => {
          const bid = getBidForItem({ bids: mySimpleBids, shipmentId: row.original.id });
          return { className: !bid || bid?.offered === false ? "negative" : "positive" };
        }
      },
      {
        Header: () => "won",
        id: "hasWon",
        className: "center aligned",
        Cell: ({ row }) => {
          const bid = getBidForItem({ bids: mySimpleBids, shipmentId: row.original.id });
          const won = bid && bid.won;
          const lost = bid && bid.list;
          return won || lost ? <Icon name={won ? "check" : "close"} /> : "pending";
        },
        setStyle: row => {
          const bid = getBidForItem({ bids: mySimpleBids, shipmentId: row.original.id });
          const won = bid && bid.won;
          const lost = bid && bid.list;
          if (won || lost) {
            return { className: bid && bid.won ? "positive" : "negative" };
          }
          return {};
        }
      }
    ];
  }

  if (isOwner) {
    columns = [
      ...columns,
      {
        Header: () => "Response",
        id: "responseCount",
        Cell: ({ row }) => countBidDataForItem({ bidders, shipmentId: row.original.id })
      },
      {
        Header: () => "assigned",
        id: "assigned",
        Cell: ({ row }) => {
          const partnerId = getWinningBidderForItem({
            bidders,
            shipmentId: row.original.id
          });
          return partnerId ? <PartnerTag accountId={partnerId} /> : "Not assigned yet";
        }
      }
    ];
  }

  const renderRowSubComponent = ({ row, colSpan }) => {
    const shipment = row.original;
    const shipmentId = shipment.id;

    // for bidders:
    const mySimpleBids = getBidsForAccount({ bidders, accountId });
    const myBid = getBidForItem({ bids: mySimpleBids, shipmentId });
    debug("subrow data bid %o", myBid);

    setActiveShipmentId(shipmentId);

    return (
      <td colSpan={colSpan}>
        <PriceRequestDataSingle shipment={shipment} />
        {isBidder && <PriceRequestBiddingSimple {...{ ...props, myBid, shipmentId, bidtracker }} />}
      </td>
    );
  };

  // todo: only keep 1 item open at a time:
  // https://stackoverflow.com/questions/47140217/how-to-collapse-other-expanded-rows-in-react-table

  // if only 1 item => expand by default else, expand none
  const initialState = { ...(items.length > 1 ? {} : { expanded: { 0: true } }) };

  return (
    <ReactTable
      tableClass="ui table"
      isExpandable
      initialState={initialState}
      renderRowSubComponent={renderRowSubComponent}
      isLoading={loading}
      columns={columns}
      data={items}
      getCellProps={cell => {
        if (typeof cell.column.setStyle === "function") {
          return cell.column.setStyle(cell.row);
        }
        return {};
      }}
    />
  );
};

PriceRequestDataOverview.propTypes = {
  ...tabPropTypes,
  loading: PropTypes.bool, // items loading
  items: PropTypes.array, // items to show
  setActiveShipmentId: PropTypes.func,
  canBid: PropTypes.bool,
  isBidder: PropTypes.bool,
  isOwner: PropTypes.bool
};

export default PriceRequestDataOverview;
