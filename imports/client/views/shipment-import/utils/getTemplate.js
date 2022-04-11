import get from "lodash.get";

// dynamically sets the component:
export function getTemplate(imp) {
  if (imp.progress?.data < 100) return "ImportFile";
  if (imp.progress?.jobs === 0) return "ImportMapping";
  if (get(imp, ["total", "shipments"]) && !get(imp, ["total", "jobs"]))
    return "ImportWait";
  return "ImportProcess";
}
