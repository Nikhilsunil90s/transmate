/* eslint-disable prettier/prettier */
import React from "react";
import { Icon } from 'semantic-ui-react';

export const DGCellRender = params => {
    const { data, node } = params;
    if (!node.rowIndex) {
        return null;
    }
    const { DG } = data;
    return <>
        {DG ? <Icon name="warning circle" /> : null}
    </>;
};
