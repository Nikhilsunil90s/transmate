import { Analysis } from "../Analysis";

export const AnalysisOverview = {
  fields: {
    type: 1,
    name: 1,
    created: 1,
    summary: 1
  },

  get({ accountId }) {
    const list = Analysis.where({ accountId }, { fields: this.fields });

    return list;
  }
};
