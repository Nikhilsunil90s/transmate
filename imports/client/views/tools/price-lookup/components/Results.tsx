import React from "react";
import { Trans } from "react-i18next";
import { List, Popup } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import PriceLookupEmpty from "./NoResults";
import {
  CurrencyTag,
  ModeTag,
  NumberTag
} from "/imports/client/components/tags";

const DEFAULT_COST_NAME = "Base rate";

type PriceLookupResultsType = {
  currency?: string;
  lookupResult: {
    audits?: Object[];
    calculationParams?: Object;
    costs: {
      id: string;
      bestCost: boolean;
      bestLeadTime: boolean;
      calculation: Object;
      carrierId: string;
      carrierName: string;
      category: string;
      costs: {
        convertedCurrency: string;
        convertedValue: number;
        exchange: number;
        listCurrency: string;
        listValue: number;
      }[];

      customerId: string;
      leadTime: {
        definition: Object;
        hours: number;
      };
      mode: string;
      status: string;
      title: string;
      totalCost: number;
      validFrom: number | Date;
      validTo: number | Date;
    }[];
    errors: Object[];
  };
};

const PriceLookupResults = ({ ...props }: PriceLookupResultsType) => {
  const { lookupResult, currency } = props;
  const items = lookupResult?.costs || [];

  if (items.length === 0) return <PriceLookupEmpty />;
  return (
    <>
      <h3>
        <Trans i18nKey="tools.priceLookup.results.title" />
      </h3>
      <ReactTable
        tableClass="ui table"
        data={items}
        columns={[
          {
            Header: <Trans i18nKey="tools.priceLookup.result.mode" />,
            accessor: "mode",
            className: "collapsing",
            Cell: ({ value }) => <ModeTag mode={value} />
          },
          {
            Header: <Trans i18nKey="tools.priceLookup.result.title" />,
            accessor: "title"
          },
          {
            Header: <Trans i18nKey="tools.priceLookup.result.carrier" />,
            accessor: "carrierName"
          },

          {
            Header: <Trans i18nKey="tools.priceLookup.result.serviceLevel" />,
            accessor: "serviceLevel"
          },
          {
            Header: <Trans i18nKey="tools.priceLookup.result.leadTime" />,
            accessor: "leadTime.hours",
            Cell: ({ value }) => (
              <NumberTag
                value={(value || 0) / 24}
                suffix={<Trans i18nKey="tools.priceLookup.result.days" />}
              />
            )
          },
          {
            Header: <Trans i18nKey="tools.priceLookup.result.cost" />,
            accessor: "totalCost",
            Cell: ({ value, row: { original } }) => {
              const costItems = [
                ...(original.costs || []).sort((a, b) => a - b)
              ];

              return (
                <Popup
                  on="hover"
                  size="large"
                  header={<Trans i18nKey="tools.priceLookup.result.detail" />}
                  content={
                    <List>
                      {costItems.map((cost, i) => (
                        <List.Item key={`cost-${i}`}>
                          <List.Content floated="right">
                            <CurrencyTag
                              value={cost.total?.convertedValue}
                              currency={cost.total?.convertedCurrency}
                            />
                          </List.Content>
                          <List.Content>
                            <List.Header>
                              {cost.rate?.name || DEFAULT_COST_NAME}
                            </List.Header>
                            <List.Description>
                              {cost.rate?.tooltip}
                            </List.Description>
                          </List.Content>
                        </List.Item>
                      ))}
                    </List>
                  }
                  trigger={
                    <span style={{ cursor: "pointer" }}>
                      <CurrencyTag value={value} currency={currency} />
                    </span>
                  }
                />
              );
            }
          }
        ]}
      />
    </>
  );
};

export default PriceLookupResults;
