import React from "react";
import PropType from "prop-types";
import { Button, List, Label, Icon, Image } from "semantic-ui-react";
import { Trans } from "react-i18next";

import { currencyFormat } from "/imports/utils/UI/helpers";

const PackingLabelOption = ({ label, disabled, isFastest, isCheapest, onSelect }) => {
  const { rateId, provider, amount, currency, serviceLevel, days, providerImage75 } = label;
  const handleClick = () => onSelect(rateId);

  return (
    <List.Item>
      <List.Content floated="right">
        <Button
          basic
          content={<Trans i18nKey="shipment.form.costs.button.select-option" />}
          onClick={handleClick}
          disabled={disabled}
          size="big"
        />
      </List.Content>
      {providerImage75 && <Image size="tiny" verticalAlign="middle" src={providerImage75} />}
      <List.Content>
        <List.Header className="ts-shipment-pick__option-header">
          {provider}
          {serviceLevel?.name && (
            <span style={{ opacity: "50%" }}>{` - ${serviceLevel.name}`}</span>
          )}
          <span style={{ float: "right" }}>
            {isCheapest && (
              <Label
                key="bestPrice"
                color="blue"
                className="col"
                content={
                  <>
                    <Icon name="money" /> <Trans i18nKey="shipment.carrier-select.bestPrice" />
                  </>
                }
              />
            )}

            {isFastest && (
              <Label
                key="bestLeadTime"
                color="blue"
                className="col"
                content={
                  <>
                    <Icon name="clock" /> <Trans i18nKey="shipment.carrier-select.bestLeadTime" />
                  </>
                }
              />
            )}

            {days && (
              <Label>
                <Icon name="clock" /> {days}{" "}
                <Trans i18nKey="shipment.carrier-select.leadTimeDays" />
              </Label>
            )}
          </span>
        </List.Header>
        <span className="ts-shipment-pick__option-price transportprice">
          {currencyFormat(Number(amount), currency)}
        </span>
      </List.Content>
    </List.Item>
  );
};

PackingLabelOption.propTypes = {
  label: PropType.shape({
    rateId: PropType.string.isRequired,
    provider: PropType.string,
    amount: PropType.oneOfType([PropType.number, PropType.string]),
    currency: PropType.string,
    serviceLevel: PropType.shape({
      name: PropType.string
    }),
    days: PropType.number
  }),
  disabled: PropType.bool,
  isFastest: PropType.bool,
  isCheapest: PropType.bool,
  onSelect: PropType.func.isRequired
};

export default PackingLabelOption;
