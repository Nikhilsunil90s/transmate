import moment from "moment";

const MomentTag = ({ date, format = "YYYY-MM-DD" }) => {
  const formattedDate = moment(date).format(format);
  return `${formattedDate}`;
};

export default MomentTag;
