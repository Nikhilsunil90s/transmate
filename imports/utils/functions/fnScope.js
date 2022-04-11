import { oPath } from "/imports/utils/functions/path.js";

export const rowHeaderFormat = row => {
  let { name } = row.lanes;
  const rng = oPath(["volumes", "ranges"], row);
  const equipmentName = oPath(["equipments", "name"], row);
  const DG = row.goodsDGClass;
  if (rng) {
    if (rng.name) {
      name += ` (${rng.name})`;
    } else {
      name += ` (${rng.from}-${rng.to} ${row.volumes.uom})`;
    }
  }
  name += equipmentName ? ` - ${equipmentName}` : "";
  name += row.goodsDG != null ? ` - ${row.goodsDG ? "DG" : "non-DG"}` : "";
  name += DG ? ` - ${DG}` : "";
  return name;
};
