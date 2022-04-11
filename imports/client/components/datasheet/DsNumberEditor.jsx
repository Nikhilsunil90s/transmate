/* eslint-disable */
import React, { Component } from "react";
import { DsTextEditorBase } from './DsTextEditorBase';

export class DsNumberEditor extends DsTextEditorBase {
    // eslint-disable-next-line class-methods-use-this
    get type() {
        return 'number';
    }
}
