import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { PriceList } from "/imports/api/pricelists/PriceList.js";
import "./specialRequirements.html";

Template.PriceListFormSpecialRequirements.onRendered(function onRendered() {
  $(".ui.accordion")
    .first()
    .accordion();
  this.autorun(() => {
    const priceListId = null; // FlowRouter.getParam("_id")
    const priceList = PriceList.first(priceListId);
    if (priceList) {
      const $checkedItems = $(".special-requirement-checkbox:checked");
      $checkedItems.forEach(checkedItem => {
        const $contentItems = $(checkedItem).parents(".content");
        $contentItems.forEach(contentItem => {
          $(contentItem).addClass("active");
          $(contentItem)
            .prev()
            .addClass("active");
        });
      });
    }
  });
});

Template.PriceListFormSpecialRequirements.helpers({
  // eslint-disable-next-line consistent-return
  isChecked(name) {
    // eslint-disable-next-line no-undef
    const priceList = PriceList.first(FlowRouter.getParam("_id"));
    // eslint-disable-next-line no-undef
    if (priceList && FlowRouter.getParam("_id")) {
      priceList.specialRequirements = priceList.specialRequirements || [];
      return priceList.specialRequirements.indexOf(name) > -1;
    }
  }
});
