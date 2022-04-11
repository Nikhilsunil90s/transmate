export function constructColumnKey(
  name: string = "",
  existingCalculationColumns: string[] = []
) {
  let cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/gim, " ")
    .replace(/^[ \t]+|[ \t]+$/, "")
    .replace(" ", "_");

  let checkName = cleanName;
  let i = 1;
  while (existingCalculationColumns.includes(checkName)) {
    checkName = `${cleanName}_${i}`;
    i += 1;
  }

  return i > 1 ? checkName : cleanName;
}
