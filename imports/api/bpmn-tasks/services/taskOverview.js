import { Task } from "../Task";
import { getPriceRequest } from "../../priceRequest/services/query.getPriceRequest";

const debug = require("debug")("priceRequest:tasks");

const ICON_MAP = {
  approval: "check square outline",
  task: "hand paper outline"
};

export const taskOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  fields: {
    taskType: 1,
    created: 1,
    userParams: 1,
    finished: 1,
    references: 1
  },

  async getData({ filters = {} }) {
    this.list = await Task.where(
      {
        type: "bpmn:UserTask",
        deleted: { $ne: true },
        "userParams.userIds": userId,
        "references.id": { $exists: true },
        ...filters
      },
      { fields: this.fields, sort: { "userParams.dueDate": -1 } }
    );
    return this;
  },

  // quick fix to only show active pricerequests
  async addReferenceStatus({ filtered = true }) {
    // accountId needed to adapt view to user (bidder?)
    debug("full list qty", this.list.length);
    const priceRequestIds = this.list
      .filter(item => item.references.type === "priceRequest")
      .map(item => item.references.id);
    debug("priceRequestIds %o", priceRequestIds);

    // get list of ids we can look at
    const prStatuses = await getPriceRequest({
      accountId,
      userId
    }).checkStatusIds({
      priceRequestIds,
      accountId: this.accountId
    });
    debug("prStatuses %o", prStatuses);
    this.list = this.list.map(item => {
      let referenceActive = true;
      let referenceStatus;
      if (item.references.type === "priceRequest") {
        // { priceRequestId, accountId, userId }

        const priceRequest = prStatuses.find(
          pr => pr._id === item.references.id
        );

        referenceStatus = (priceRequest || {}).status;

        // const priceRequest = PriceRequest.first(item.references.id, {
        //   fields: { status: 1 }
        // });
        debug(
          "check status of priceRequest %s status :%s",
          item.references.id,
          referenceStatus
        );
        referenceActive =
          referenceStatus && ["requested"].includes(referenceStatus);
      }

      return { ...item, referenceActive, referenceStatus };
    });

    if (filtered) {
      this.list = this.list.filter(el => el.referenceActive);
      debug("filtered list qty", this.list.length);
    } else {
      // sort and put non active at end, simpelest way to keep dueDate sorting and show non active at end
      const activeList = [];
      const nonActiveList = [];
      this.list.forEach(el => {
        // eslint-disable-next-line no-unused-expressions
        el.referenceActive ? activeList.push(el) : nonActiveList.push(el);
      });
      this.list = activeList.concat(nonActiveList);
      debug(
        "sorted list ",
        this.list.map(el => el.referenceActive)
      );
    }

    return this;
  },
  toList() {
    this.list = this.list.map(item => ({
      icon: ICON_MAP[item.taskType],
      type: item.taskType,
      dueDate: item.userParams.dueDate,
      references: item.references,
      userParams: item.userParams,
      active: item.referenceActive
    }));
    return this;
  },
  get() {
    return this.list;
  }
});
