import { toast } from "react-toastify";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";

// UI
import { Table, ButtonGroup, Button, Popup, Icon } from "semantic-ui-react";
import { IconSegment } from "../../../components/utilities/IconSegment";
import { PartnerTag, AccountRatingTag, MailEventTag } from "/imports/client/components/tags";

import {
  CellPositive,
  CellNegative,
  emailsSend,
  EmailMissing
} from "../../../components/tables/TableComponents";
import initializeConfirm from "../../../components/modals/confirm";
import SelectPartnerModal from "../../../components/modals/specific/partnerSelect";

import { tabProptypes } from "../utils/propTypes";
import { SAVE_BIDDERS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("price-request:UI");

const BiddersTableRow = ({ onRemove, bidder, canEdit }) => {
  const [isExpanded, setExpanded] = useState(false);
  const toggleExpaned = () => {
    setExpanded(!isExpanded);
  };
  const { accountId, name } = bidder;
  return (
    <>
      <Table.Row key={`base-${accountId}`}>
        <Table.Cell collapsing onClick={toggleExpaned}>
          {isExpanded ? <Icon name="caret down" /> : <Icon name="caret right" />}
        </Table.Cell>
        <Table.Cell>
          <PartnerTag {...{ accountId, name }} />
        </Table.Cell>
        <Table.Cell>
          <AccountRatingTag partnerId={accountId} />
        </Table.Cell>
        <Table.Cell textAlign="center">
          <>
            <Icon name="users" />
            {(bidder.contacts || []).length}
          </>
        </Table.Cell>
        {(bidder.userIds || []).length > 0 && bidder.notified
          ? emailsSend(bidder.userIds.length)
          : EmailMissing}
        {bidder.firstSeen ? CellPositive : CellNegative}
        {bidder.bid ? CellPositive : CellNegative}
        <Table.Cell>
          <TableActions {...{ onRemove, bidder, canEdit }} />
        </Table.Cell>
      </Table.Row>
      {isExpanded && (
        <Table.Row key={`detail-${accountId}`}>
          <Table.Cell colSpan="5">
            <TableDetails contacts={bidder.contacts} />
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
};

const BiddersTable = ({ bidders, canEdit, onRemove }) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          {[
            ["expanding", null],
            ["partner", null],
            [null, null, true],
            ["contacts", "center"],
            ["email", "center"],
            ["viewed", "center"],
            ["bid", "center"],
            ["won", "center"],
            ["actions", null]
          ].map(([col, textAlign, collapsing]) => {
            return (
              <Table.HeaderCell key={col} {...{ textAlign, collapsing }}>
                {col && <Trans i18nKey={`price.request.bidders.table.${col}`} />}
              </Table.HeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {bidders.map(bidder => (
          <BiddersTableRow key={bidder.accountId} {...{ bidder, canEdit, onRemove }} />
        ))}
      </Table.Body>
    </Table>
  );
};

const TableActions = ({ onRemove, bidder, canEdit }) => {
  const { priceListId } = bidder;
  const { showConfirm, Confirm } = initializeConfirm();
  const handleDelete = () => {
    onRemove(bidder.accountId);
    showConfirm(false);
  };
  const { goRoute, name: routeName } = useRoute();

  return (
    <ButtonGroup>
      {priceListId && (
        <Popup
          content={<Trans i18nKey="price.request.bidders.table.action.viewOffer" />}
          trigger={
            <Button
              as="a"
              onClick={() => goRoute("priceList", { _id: priceListId }, { redirect: routeName })}
              icon="eye"
              size="mini"
            />
          }
        />
      )}
      {canEdit && (
        <>
          <Popup
            content={<Trans i18nKey="price.request.bidders.table.action.remove" />}
            trigger={<Button as="a" icon="trash" size="mini" onClick={() => showConfirm(true)} />}
          />
          <Confirm onConfirm={handleDelete} />
        </>
      )}
      {/* {notes && (
        <ModalTrigger
          title={<Trans i18nKey={"price.request.bidders.table.notes"} />}
          options={{ types: ["carrier", "provider"] }}
          body={<NotesModal {...{ notes }} />}
        >
          <Button icon="sticky note outline" size="mini" />
        </ModalTrigger>
      )} */}
    </ButtonGroup>
  );
};

const TableDetails = ({ contacts = [] }) => {
  if (contacts.length === 0) return "No contacts found";
  return (
    <Table
      tableData={contacts}
      renderBodyRow={({ firstName, lastName, mail, phone, events }, j) => ({
        key: `userRow-${j}`,
        cells: [
          mail
            ? { key: "mail", content: mail }
            : {
                key: "mail",
                icon: "attention",
                content: `No email specified!`
              },
          {
            key: "name",
            content: firstName || lastName ? `${firstName || ""} ${lastName || ""}` : " - "
          },

          { key: "phone", content: phone },
          {
            key: "events",
            content: (events || [])
              .sort((a, b) => a.timestamp - b.timestamp)
              .slice(-10)
              .map((action, i) => <MailEventTag key={`user-mail-event-${i}`} action={action} />)
          }
        ]
      })}
    />
  );
};

// if status == draft -> can select multiple, otherwise select single
const PriceRequestPartnersFooter = ({ canSelectMultiple, savePartners, bidderIds = [] }) => {
  debug("load PriceRequestPartnersFooter", { bidderIds });
  const value = canSelectMultiple ? [...bidderIds] : "";
  const options = {
    includeInactive: false,
    types: ["carrier", "provider"],
    ...(!canSelectMultiple ? { excludeAccounts: bidderIds } : undefined)
  };

  const handleSave = ({ partnerId }) => {
    // partnerId is [] when multiple, otherwise String
    debug("selected bidders %o", partnerId);
    let partnerList = partnerId;
    if (!canSelectMultiple) {
      partnerList = bidderIds.concat([partnerId]);
    }
    savePartners({ partnerList });
  };
  debug("get partners for:%o", options);
  return (
    <SelectPartnerModal
      title={<Trans i18nKey="price.request.partner.modal.title" />}
      options={options}
      onSave={handleSave}
      multiple={canSelectMultiple}
      value={value}
    >
      <Button
        data-test="editPartners"
        icon="plus"
        size="mini"
        content={<Trans i18nKey="price.request.bidders.add" />}
      />
    </SelectPartnerModal>
  );
};
//#endregion

const PartnerSegment = ({ tender = {}, security = {}, refreshData }) => {
  const [saveBidders] = useMutation(SAVE_BIDDERS);
  const { bidders = [] } = tender;
  const bidderIds = bidders.map(el => el.accountId);
  debug("bidder ids %o", bidderIds);
  const { canEditPartners } = security;
  const canSelectMultiple = tender.status === "draft";

  // return the new array of bidders, mutation sorts it out.
  const editBidders = async partnerIds => {
    const {
      data: { saveBidders: response },
      error: mutationError
    } = await saveBidders({
      variables: { input: { tenderId: tender.id, partnerIds } }
    });
    debug("response %o", response);

    if (mutationError) {
      console.error("error", mutationError);
      return;
    }
    const { accountsAdded, accountsRemoved } = response.success || {};
    toast.info(`added ${accountsAdded} accounts, removed ${accountsRemoved} accounts`);
    refreshData();
  };

  const onRemove = accountIdToRemove => {
    debug("removing bidders %o", accountIdToRemove);
    const newAccountIds = bidderIds.filter(id => id !== accountIdToRemove);
    editBidders(newAccountIds);
  };

  const savePartners = ({ partnerList }) => {
    // called from the modal
    if (!Array.isArray(partnerList)) return toast.error("partner should be list");
    return editBidders(partnerList);
  };

  let body;

  if (bidders.length > 0) {
    body = <BiddersTable {...{ bidders, canEdit: canEditPartners, onRemove }} />;
  } else {
    body = (
      <p>
        <Trans i18nKey="price.request.bidders.table.empty" />
      </p>
    );
  }

  const segmentData = {
    name: "partners",
    icon: "users",
    title: <Trans i18nKey="price.request.bidders.title" />,
    body,
    ...(canEditPartners
      ? {
          footer: <PriceRequestPartnersFooter {...{ canSelectMultiple, savePartners, bidderIds }} />
        }
      : undefined)
  };

  return <IconSegment {...segmentData} />;
};

PartnerSegment.propTypes = tabProptypes;

export default PartnerSegment;
