import { PriceListTemplate } from "../PriceListTemplate";

export const priceListTemplateSrv = ({ accountId }) => ({
  accountId,
  getList({ options }) {
    this.options = options; // todo
    const fields = { title: 1 };

    const query = { public: true };
    return PriceListTemplate.where(query, { fields }).map(({ id, title }) => ({
      id,
      title
    }));
  },
  get({ templateId, options = {} }) {
    const fields = options.minimal
      ? { fields: { charges: 1, settings: 1 } }
      : undefined;
    return PriceListTemplate.first(templateId, fields);
  }
});
