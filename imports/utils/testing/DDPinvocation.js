/* eslint-disable no-underscore-dangle */
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";

// eslint-disable-next-line func-names
export const triggerDDPInvocation = function(invocation, fn) {
  const { userId } = invocation;
  DDP._CurrentInvocation.withValue(
    new DDPCommon.MethodInvocation({ userId }),
    () => {
      fn();
    }
  );
};
