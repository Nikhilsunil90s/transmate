import "./UOMconversions.html";
import "../../../../components/upgrade";

// TODO [#255]: add logic for saving. modifying te converions in this section
Template.SettingsMasterDataConversions.helpers({
  conversions() {
    const { settingsData = {} } = Template.instance().data;
    return settingsData.UOMconversions;
  }
});
