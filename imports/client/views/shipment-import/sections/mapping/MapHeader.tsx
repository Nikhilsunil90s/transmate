import React, { ReactElement } from "react";
import get from "lodash.get";
import { Trans } from "react-i18next";

import { Form, Dropdown, Icon } from "semantic-ui-react";

// helpers:
import { displayKey } from "/imports/api/imports/helpers/displayKey";
import { importFields } from "/imports/api/imports/helpers/importFields";

const debug = require("debug")("shipment-import");

const Indent = () => <>{"\u00A0"}</>;
const IndentedOption = ({
  depth,
  text,
  chevron
}: {
  depth: number;
  text: string | ReactElement;
  chevron?: boolean;
}) => (
  <>
    {[
      ...[...Array((depth - 1) * 4)].map((e, i) => <Indent key={i} />),
      chevron ? <Icon key="icon" name="chevron right" color="grey" /> : null,
      text
    ]}
  </>
);

function prepfieldOpts(alreadyMappedKeys, currentKey) {
  debug("run  prepfieldOpts");
  const allFieldOpts = importFields
    .filter(({ key }) =>
      alreadyMappedKeys
        ? !(alreadyMappedKeys.includes(key) && key !== currentKey)
        : true
    )
    .map(({ key }) => ({
      key,
      value: key,
      text: <Trans i18nKey={key} />,
      depth: key.split(".").length
    }));

  // Group options
  const grpOptions = [];
  let currentGroups = [];
  let k = 0;
  allFieldOpts.forEach(option => {
    if (option.depth > 1) {
      const groups = option.value.split(".");
      groups.pop();
      if (groups !== currentGroups) {
        groups.forEach((group, j) => {
          if (group !== currentGroups[j]) {
            if (j > 0) {
              // Reconstruct full key for translation
              // eslint-disable-next-line no-param-reassign
              group = groups.slice(0, j + 1).join(".");
            }

            // Add header label
            const text = (
              <Trans key={`group-${group}_${j}`} i18nKey={`${group}._`} />
            );
            const depth = j + 1;
            grpOptions.push({
              key: `grp-${group}-${k}`,
              text,
              depth,
              content: (
                <IndentedOption
                  key={`grpIndent-${group}-${k}`}
                  {...{ text, depth }}
                />
              )
            });
            k += 1;

            // Make sure the additional levels are displayed as well
            currentGroups = [];
          }
        });
        currentGroups = groups;
      }
    }
    return grpOptions.push({
      ...option, // {value, text, depth}
      text: (
        <>
          {option.text} <span style={{ opacity: 0.5 }}>({option.key})</span>
        </>
      ),
      content: (
        <IndentedOption {...option} key={`indent_${option.key}`} chevron />
      )
    });
  });

  grpOptions.push({
    key: "ignore",
    value: "ignore",
    text: "Ignore this column",
    content: <span style={{ opacity: 0.45 }}>Ignore this column</span>,
    depth: 1
  });
  return grpOptions;
}

// const groupedOptions = prepfieldOpts(alreadyMappedKeys, currentKey);

const ImportMappingSelect = ({ value, header, onChange, imp }) => {
  const alreadyMappedKeys = Object.values(get(imp, ["mapping", "headers"], {}));

  return (
    <Form.Field className="header">
      <label>{displayKey(header)}</label>
      <Dropdown
        search
        selection
        lazyLoad
        options={prepfieldOpts(alreadyMappedKeys, value)}
        value={value}
        onChange={(_, { value: newValue }) => onChange(newValue)}
      />
    </Form.Field>
  );
};

export default ImportMappingSelect;
