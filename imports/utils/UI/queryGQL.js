import { toast } from "react-toastify";

const debug = require("debug")("queryFunction");

/** query (direct with 'network-only' fetch policy)
 * @param {{client: Object, query: Object, startMsg?: String, successMsg?: String, errorMsg?: error}}
 * @param {((err: Error, res: any) => void)=} cb on success
 *
 */
export const queryGQL = async (
  { client, query: apolloQuery, startMsg, successMsg, errorMsg },
  cb
) => {
  debug("query %o", apolloQuery);
  try {
    if (startMsg) toast.info(startMsg);
    const { errors, data = {}, meta } = await client.query({
      ...apolloQuery,
      fetchPolicy: "network-only"
    });
    debug("client.query result %o", { errors, data, meta });
    if (errors && errors.length) return cb(errors[0]);
    if (typeof cb === "function") cb(null, data);
    if (successMsg) toast.success(successMsg);
    debug("result data: %o", data);
    return data;
  } catch (error) {
    debug("query error %o", error);
    toast.error(errorMsg || error.message);
    return error;
  }
};
