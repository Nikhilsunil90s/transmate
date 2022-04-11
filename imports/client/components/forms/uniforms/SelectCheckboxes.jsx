import React, { useState } from "react";
import { Dropdown, Input } from "semantic-ui-react";
import { connectField } from "uniforms";

export const SelectCheckboxes = ({ ...props }) => {
  const { value = [], options = [], onChange, label = "Select" } = props;
  const [selectedItems, setSelectedItems] = useState(value);
  const [allOptions, setOptions] = useState(options);

  const toggleItem = id => {
    let mod = selectedItems;
    const isSelected = selectedItems.includes(id);
    if (isSelected) {
      mod = mod.filter(item => item !== id);
    } else {
      mod = [...mod, id];
    }
    setSelectedItems(mod);
  };

  function filterFieldOptions(str) {
    const filteredList = options.filter(({ label: fLabel }) =>
      fLabel.toLowerCase().includes(str.toLowerCase())
    );
    setOptions(filteredList);
  }

  // we use the onClose fn of the dropdown to store the data
  function saveSelection() {
    onChange(selectedItems);
  }

  return (
    <Dropdown text={label} icon="filter" labeled button className="icon" onClose={saveSelection}>
      <Dropdown.Menu>
        <Input
          icon="search"
          iconPosition="left"
          className="search"
          onClick={e => e.stopPropagation()}
          onChange={(e, { value: val }) => {
            filterFieldOptions(val);
          }}
        />
        <Dropdown.Divider />
        <Dropdown.Header icon="tags" content="Tag Label" />
        <Dropdown.Menu scrolling>
          {allOptions.map((option, i) => (
            <div
              className="ui item checkbox"
              key={i}
              onClick={e => {
                e.stopPropagation();
                toggleItem(option.id);
              }}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(option.id)}
                onChange={() => {}}
              />
              <label>{option.label}</label>
            </div>
          ))}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default connectField(SelectCheckboxes);
