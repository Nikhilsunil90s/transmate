/* eslint-disable prettier/prettier */
import React from "react";
import { DsEditorBase } from './DsEditorBase';

export class DsDropDownEditor extends DsEditorBase {
    render() {
        const { options, disabled } = this.props;
        return (
            <select disabled={disabled} style={{ width: '100%', height: '100%' }} value={this.state.value} onChange={this.handleChange}>
                {options.map(({ text, value }, index) => <option key={index} value={value}>{text}</option>)}
            </select>
        );
    }
}
