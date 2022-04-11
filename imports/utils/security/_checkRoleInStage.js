export const getRoleForStageObj = (stage, accountId) => {
  return {
    isCarrier: stage.carrierId === accountId
  };
};
