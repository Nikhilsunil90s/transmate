import DataLoader from "dataloader";

import {
  allAccountsLoader,
  stageLoader,
  shipmentLoader,
  userLoader
} from "./dataloader-functions";

import { nestedItemLoader } from "/imports/api/items/apollo/loaders";

import { addressAnnotationLoader } from "/imports/api/addresses/apollo/loaders";

export const getLoaders = ({ userId, accountId }) => ({
  allAccountsLoader: new DataLoader(keys =>
    allAccountsLoader({ keys, userId, accountId })
  ),
  nestedItemLoader: new DataLoader(keys =>
    nestedItemLoader({ keys, userId, accountId })
  ),
  stageLoader: new DataLoader(keys => stageLoader({ keys, userId, accountId })),
  addressAnnotationLoader: new DataLoader(keys =>
    addressAnnotationLoader({ keys, userId, accountId })
  ),
  shipmentLoader: new DataLoader(keys =>
    shipmentLoader({ keys, userId, accountId })
  ),
  userLoader: new DataLoader(keys => userLoader({ keys, userId, accountId }))
});
