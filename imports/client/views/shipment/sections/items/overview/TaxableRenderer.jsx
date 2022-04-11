/* eslint-disable prettier/prettier */
import React from "react";
import { toFixed2 } from '../../../../../../utils/number-utils';

export const TaxableRenderer = params => {
    const { data, node, taxableType } = params;
    if (!node.rowIndex) {
        return null;
    }

    const { taxable } = data;
    if (!taxable) {
        return null;
    }
    const item = taxable.find(({ type }) => type === taxableType);
    if (!item) {
        return null;
    }
    if (item.quantity == null) {
        return null;
    }
    return <>
        {toFixed2(item.quantity, 2)}
    </>;
};
