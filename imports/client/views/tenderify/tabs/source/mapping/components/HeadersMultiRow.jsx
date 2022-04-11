import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Checkbox, Table, Icon, Input, Form } from "semantic-ui-react";

const DEFAULT_MAP_ROW = {
  fill: false,
  location: { absolute: null }
};

const TenderifyMappingHeadersMultiRow = ({
  mapRow,
  parentFieldOptions,
  index,
  onChange,
  onRemoveRow
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState(mapRow || DEFAULT_MAP_ROW);

  const setRelative = isRelative => {
    const updatedState = {
      ...state,
      ...(isRelative
        ? { location: { relative: { r: "", c: "" } } }
        : { location: { absolute: "" } })
    };
    setState(updatedState);
    onChange(updatedState, index);
  };

  const update = update => {
    const updatedState = { ...state, ...update };
    setState(updatedState);
    onChange(updatedState, index);
  };

  // onChange;
  return (
    <Table.Row verticalAlign="middle">
      <Table.Cell
        width={5}
        content={
          <Dropdown
            name="target"
            selection
            value={state.target}
            options={parentFieldOptions}
            onChange={(e, { value }) => update({ target: value })}
          />
        }
      />
      <Table.Cell
        width={2}
        content={
          <Checkbox
            name="fill"
            checked={!!state.fill}
            label="Fill out"
            onChange={() => update({ fill: !state.fill })}
          />
        }
      />
      <Table.Cell
        width={2}
        content={
          // releative?
          <Checkbox
            checked={!!state.location?.relative}
            onChange={() => setRelative(!state.location?.relative)}
            label={t("tenderify.mapping.header.multi.relative")}
          />
        }
      />
      <Table.Cell
        width={6}
        content={
          !!state.location?.relative ? (
            <Form.Group widths={2}>
              <Form.Field
                content={
                  <Input
                    placeholder="Row"
                    name="location.relative.r"
                    value={state.location?.relative?.r}
                    onChange={(e, { value }) =>
                      update({
                        location: { relative: { r: value, c: state.location?.relative?.c } }
                      })
                    }
                  />
                }
              />

              <Form.Field
                content={
                  <Input
                    name="location.relative.c"
                    placeholder="Col"
                    value={state.location?.relative?.c}
                    onChange={(e, { value }) =>
                      update({
                        location: { relative: { c: value, r: state.location?.relative?.r } }
                      })
                    }
                  />
                }
              />
            </Form.Group>
          ) : (
            <Input
              name="locaton.absolute"
              placeholder="A10"
              value={state.location?.absolute || ""}
              onChange={(e, { value }) => update({ location: { absolute: value } })}
            />
          )
        }
      />
      <Table.Cell
        width={1}
        content={
          <Icon
            name="trash alternate outline"
            style={{ cursor: "pointer" }}
            onClick={() => onRemoveRow(index)}
          />
        }
      />
    </Table.Row>
  );
};

export default TenderifyMappingHeadersMultiRow;
