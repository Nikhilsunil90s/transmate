/* eslint-disable no-use-before-define */
import { Meteor } from "meteor/meteor";
import moment from "moment";
import React from "react";

import { useTracker } from "meteor/react-meteor-data";
import { TenderBid } from "/imports/api/tender-bids/TenderBid";
import { TenderBidType } from "/imports/api/tender-bids/interfaces/tenderBid";

export interface WorkerStatusType {
  loading: boolean;
  worker?: {
    isRunning: boolean;
    action: string;
    current: number;
    total: number;
  };
}

const useTenderBidWokerStatus = (tenderBidId: string) => {
  
  if (!tenderBidId){
    return {
      loading:true
    };
  }
  return useTracker(() => {
    // can not use async?
    // The publication must also be secure
    const subscription = Meteor.subscribe("tenderbid", tenderBidId);

    const tenderBids = TenderBid.find({ _id: tenderBidId }).fetch()
    
    const tenderBid = tenderBids?.length ? tenderBids[0] : null;
    return {
      worker: tenderBid?.worker,
      loading: !subscription.ready()
    };
  }, [tenderBidId]) as WorkerStatusType;
};

export default useTenderBidWokerStatus;
