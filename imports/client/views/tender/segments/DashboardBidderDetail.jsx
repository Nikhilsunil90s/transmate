import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Dropdown, Form, List } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const BidView = ({ tender, selectedBidderId }) => {
  const bidderData =
    (tender.bidders || []).find(({ accountId }) => accountId === selectedBidderId) || {};
  const offeredPriceLists = bidderData.priceLists;
  const offeredDocuments = bidderData.documents;
  const hasItemsToShow = offeredPriceLists?.length > 0 || offeredDocuments?.length > 0;

  return hasItemsToShow ? (
    <List>
      {offeredPriceLists && (
        <List.Item>
          <List.Content>
            <List.Header content="Rate cards" />
            <List.List>
              {offeredPriceLists.map((priceList, i) => (
                <List.Item key={`PL-${i}`}>
                  <List.Content>
                    <a
                      href={generateRoutePath("priceList", { _id: priceList.id })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {priceList.title}
                    </a>
                  </List.Content>
                </List.Item>
              ))}
            </List.List>
          </List.Content>
        </List.Item>
      )}
      {offeredDocuments && (
        <List.Item>
          <List.Content>
            <List.Header content="Documents" />
            <List.List>
              {offeredDocuments.map((doc, i) => (
                <List.Item key={`doc-${i}`}>
                  <List.Content>
                    <a href={doc.id}>{doc.name}</a>
                  </List.Content>
                </List.Item>
              ))}
            </List.List>
          </List.Content>
        </List.Item>
      )}
    </List>
  ) : (
    <>
      <br />
      <p>
        <Trans i18nKey="tender.dashboard.detail.empty" />
      </p>
    </>
  );
};

const Detail = ({ ...props }) => {
  const bidders = props.tender?.bidders || [];
  const [selectedBidderId, setSelectedBidder] = useState(bidders[0]?.accountId);

  return (
    <>
      <Form>
        <Form.Field width="six">
          <label>
            <Trans i18nKey="tender.dashboard.detail.select" />
          </label>
          <Dropdown
            selection
            options={bidders.map(({ accountId: key, name }) => ({ key, value: key, text: name }))}
            value={selectedBidderId}
            onChange={(_, { value }) => setSelectedBidder(value)}
          />
        </Form.Field>
      </Form>
      <BidView {...props} {...{ selectedBidderId }} />
    </>
  );
};

const BidderDetail = ({ ...props }) => {
  const bidders = props.tender?.bidders || [];

  return (
    <IconSegment
      name="detail"
      icon="magnify"
      title={<Trans i18nKey="tender.dashboard.detail.title" />}
      body={
        bidders.length ? (
          <Detail {...props} />
        ) : (
          <p>
            <Trans i18nKey="tender.dashboard.noPartners" />
          </p>
        )
      }
    />
  );
};

export default BidderDetail;
