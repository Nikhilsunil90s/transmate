/* eslint-disable prettier/prettier */
import React from "react";
import { DsEditorBase } from './DsEditorBase';

export class DsTextEditorBase extends DsEditorBase {
    // eslint-disable-next-line class-methods-use-this
    get type() {
        return 'text';
    }

    render() {
        const { disabled } = this.props;
        return (
            <input disabled={disabled} type={this.type} style={{ width: '100%', height: '100%', border: 'none' }} value={this.state.value} onChange={this.handleChange} />
        );
    }
}
