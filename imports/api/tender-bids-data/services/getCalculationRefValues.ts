import get from "lodash.get";

// function to grab the calculation reference fields and project it to an object
// used in the evaluate formula fn
export class GetCalculationRefValues {
  refValues: { [k: string]: number };
  constructor(
    calculationObject: any = {},
    otherRefs?: { [k: string]: number }
  ) {
    const refObject = { ...otherRefs };
    (calculationObject.charges || []).forEach(({ leg, name }) => {
      refObject[name] = get(calculationObject, [leg, name, "amount", "value"]);
    });
    Object.entries(calculationObject.conversions || {}).forEach(
      ([k, v]: [string, number | { value: number }]) => {
        // FIXME: if fully transitioned to object -> remove this code
        if (typeof v === "number") {
          refObject[k] = v;
        } else {
          refObject[k] = v.value || 1;
        }
      }
    );

    // TODO: other manual calculation columns...
    this.refValues = refObject;
  }

  // function to update the refValues
  add(stringKey: string, value: number) {
    const refKey: string = stringKey.split(".").slice(-1)[0];
    this.refValues[refKey] = value;
  }
}
