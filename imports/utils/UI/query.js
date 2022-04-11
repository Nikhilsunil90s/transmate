import { toast } from "react-toastify";

const debug = require("debug")("queryFunction");

/** query (direct with 'network-only' fetch policy)
 * @param {{client: Object, query: Object, startMsg: String, successMsg: String, errorMsg: error}}
 * @param {function} cb on success
 */
export const query = async (
  { client, query: apolloQuery, startMsg, successMsg, errorMsg },
  cb
) => {
  debug("query %o", apolloQuery);
  try {
    if (startMsg) toast.info(startMsg);
    const { errors, data = {} } = await client.query({
      ...apolloQuery,
      fetchPolicy: "network-only"
    });
    if (errors) throw errors;
    if (typeof cb === "function") cb(data);
    if (successMsg) toast.success(successMsg);
    debug("result data: %o", data);
    return data;
  } catch (error) {
    debug("query error %o", error);
    toast.error(errorMsg || "Could not get data");
    return error;
  }
};
