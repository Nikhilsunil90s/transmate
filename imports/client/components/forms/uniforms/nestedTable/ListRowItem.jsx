import React from "react";
import { connectField } from "uniforms";
import { AutoField } from "uniforms-semantic";

// import ListDelField from "./ListDelField";
import { Table } from "semantic-ui-react";

const ListItem = ({ children = <AutoField label={null} name="" style={{ margin: 0 }} /> }) => (
  <Table.Row>{children}</Table.Row>
);

export default connectField(ListItem, { initialValue: false });

/*
const ListRowItem = props => (
  <Table.Row>
    {props.children ? (
      Children.map(props.children, child =>
        React.cloneElement(child, {
          value: props.value,
          name: joinName(props.name, child.props.name),
          label: null,
          style: {
            margin: 0,
            ...child.props.style
          }
        })
      )
    ) : (
      <Table.Cell>
        <AutoField {...props} style={{ margin: 0 }} />
      </Table.Cell>
    )}
    <Table.Cell className="bottom aligned">
      {props.value.isAdded && <ListDelField name={props.name} />}
    </Table.Cell>
  </Table.Row>
);

export default connectField(ListRowItem, {
  includeInChain: false,
  includeParent: true
});
*/
