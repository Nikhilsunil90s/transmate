import { toast } from "react-toastify";

const debug = require("debug")("mutateFunction");

/** mutate
 * @param {{client: Object, query: Object, startMsg?: String, successMsg?: String, errorMsg?: error}}
 * @param {function(data)=} cb on success
 */
export const mutate = async (
  { client, query, startMsg, successMsg, errorMsg },
  cb
) => {
  debug("mutate %o", query);
  try {
    if (startMsg) toast.info(startMsg);
    const { errors, data } = await client.mutate(query);
    if (errors) throw errors;
    if (typeof cb === "function") cb(data);
    if (successMsg) toast.success(successMsg);
    return data;
  } catch (error) {
    console.error({ error });
    toast.error(errorMsg || "Could not save updates");
    return error;
  }
};
