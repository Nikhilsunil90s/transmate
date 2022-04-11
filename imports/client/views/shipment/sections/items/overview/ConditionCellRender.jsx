/* eslint-disable prettier/prettier */
import React from "react";
import { Icon, Popup } from 'semantic-ui-react';

export const ConditionCellRender = params => {
    const { data, node } = params;
    if (!node.rowIndex) {
        return null;
    }
    const { temperature } = data;
    
    return <>
    {temperature && temperature.condition && temperature.condition !== "" ? (
        <Popup content={temperature.condition} trigger={<Icon name="thermometer quarter" />} />
    ) : null}
</>;
};
