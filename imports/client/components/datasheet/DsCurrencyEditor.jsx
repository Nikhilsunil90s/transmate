/* eslint-disable */
import React, { Component } from "react";
import { DsTextEditorBase } from "./DsTextEditorBase";

export class DsCurrencyEditor extends DsTextEditorBase {
  // eslint-disable-next-line class-methods-use-this
  get type() {
    return "currency";
  }
}
