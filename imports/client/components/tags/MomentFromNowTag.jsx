import moment from "moment";

const MomentFromNowTag = ({ date }) => {
  const formattedDate = moment(date).fromNow();
  return `${formattedDate}`;
};

export default MomentFromNowTag;
