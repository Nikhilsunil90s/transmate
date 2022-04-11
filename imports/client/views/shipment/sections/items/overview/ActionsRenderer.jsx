/* eslint-disable prettier/prettier */
import React from "react";
import { Icon } from 'semantic-ui-react';

export const ActionsRenderer = params => {
    const { data, node, onAction } = params;
    if (!node.rowIndex) {
        return null;
    }

    const handleClick = (e) => {
        // stop propagation not work
        e.preventDefault();
        e.stopPropagation();
        onAction({
            data,
            action: 'delete'
        });
    }
    return <>
        <Icon onClick={handleClick} className="clickable" name="trash alternate outline" />
    </>;
};
