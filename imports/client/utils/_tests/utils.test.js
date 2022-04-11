import { expect } from "chai";
import {
  prepareDateTypesForShipmentUpdate,
  portColumnsFromOldDatatable
} from "/imports/client/utils";

describe("Client Utils", function testClientUtils() {
  describe("Porting columns data", function testPortingColumnsData() {
    it("should successfully remove all postfix for 'shipment.' from 'data' fields to obtain flat hierarchy targeting", function test() {
      const columns = [
        { title: "Name", data: "shipment.name" },
        { title: "Identity", data: "shipment.identity", orderable: true },
        { title: "Pickup Identity", data: "pickup.identity" },
        { title: "Wild Shipment", data: "shipment" }
      ];

      const refinedColumns = portColumnsFromOldDatatable(columns);

      expect(refinedColumns[0].name).to.equal("Name");
      expect(refinedColumns[0].selector).to.be.a("function");
      expect(refinedColumns[0].selectorName).to.equal("name");
      expect(refinedColumns[0].sortable).to.equal(false);

      expect(refinedColumns[1].name).to.equal("Identity");
      expect(refinedColumns[1].selector).to.be.a("function");
      expect(refinedColumns[1].selectorName).to.equal("identity");
      expect(refinedColumns[1].sortable).to.equal(true);

      expect(refinedColumns[2].name).to.equal("Pickup Identity");
      expect(refinedColumns[2].selector).to.be.a("function");
      expect(refinedColumns[2].selectorName).to.equal("pickup.identity");

      expect(refinedColumns[3].name).to.equal("Wild Shipment");
      expect(refinedColumns[3].selector).to.be.a("function");
      expect(refinedColumns[3].selectorName).to.equal("shipment");
    });
  });

  describe("Preparing Date Types For Updating Shipment", function testPrepareDateTypes() {
    const initialValues = {
      pickupDate: { day: "01/01/2020", time: "02:30" },
      deliveryDate: { day: "12/12/2020", time: "12:30" }
    };

    it("should pickup type with updated time", function test() {
      const updatedTime = "14:00";

      const updatedDate = prepareDateTypesForShipmentUpdate({
        updateKey: "pickupDate.time",
        value: updatedTime,
        initialValues
      });

      expect(updatedDate).to.equal(
        new Date(`${initialValues.pickupDate.day} ${updatedTime}`)
      );
    });

    it("should pickup type with updated day", function test() {
      const updatedDay = "03/05/1992";

      const updatedDate = prepareDateTypesForShipmentUpdate({
        updateKey: "pickupDate.day",
        value: updatedDay,
        initialValues
      });

      expect(updatedDate).to.equal(
        new Date(`${updatedDay} ${initialValues.pickupDate.time} `)
      );
    });

    it("should delivery type with updated time", function test() {
      const updatedTime = "14:00";

      const updatedDate = prepareDateTypesForShipmentUpdate({
        updateKey: "deliveryDate.time",
        value: updatedTime,
        initialValues
      });

      expect(updatedDate).to.equal(
        new Date(`${initialValues.pickupDate.day} ${updatedTime}`)
      );
    });

    it("should delivery type with updated day", function test() {
      const updatedDay = "03/05/1992";

      const updatedDate = prepareDateTypesForShipmentUpdate({
        updateKey: "deliveryDate.day",
        value: updatedDay,
        initialValues
      });

      expect(updatedDate).to.equal(
        new Date(`${updatedDay} ${initialValues.pickupDate.time} `)
      );
    });
  });
});
