import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import footerTests from "../footer/_test/Footer.spec";

Enzyme.configure({ adapter: new Adapter() });

describe("Components", () => {
  footerTests();
});
