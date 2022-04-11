/* eslint-disable prettier/prettier */
import React from "react";
import { AnalysisEditorBase } from './AnalysisEditorBase';

export class AnalysisTextEditorBase extends AnalysisEditorBase {
    refInput = null;

    constructor(props) {
        super(props);
        this.refInput = React.createRef();
    }

    // eslint-disable-next-line class-methods-use-this
    get type() {
        return 'text';
    }

    // eslint-disable-next-line class-methods-use-this
    afterGuiAttached() {
        // this.refInput.current.focus();
    }

    render() {
        const { disabled } = this.props;
        return (
            <input ref={this.refInput} disabled={disabled} type={this.type} style={{ width: '100%', height: '100%', border: 'none' }} value={this.state.value} onChange={this.handleChange} />
        );
    }
}
