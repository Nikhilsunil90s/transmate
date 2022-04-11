/* eslint-disable react/button-has-type */
import React from "react";
import { Pagination } from "semantic-ui-react";
import { mount } from "enzyme";
import DataTable from "@jaxtis.apia/react-data-table-component";
import { expect } from "chai";
import { PaginationFooter } from "..";

export default function testFooter() {
  describe.skip("Footer", () => {
    describe("PaginationFooter", () => {
      beforeEach(() => {});
      afterEach(() => {});

      it("can render data-tables with pagination below the screen", () => {
        const CustomFooter = props => {
          return (
            <PaginationFooter {...props}>
              <button>Click here</button>
            </PaginationFooter>
          );
        };

        const wrapper = mount(
          <DataTable
            columns={[{ name: "name", selector: "name" }]}
            data={[{ name: "First" }, { name: "Second" }]}
            paginationComponent={CustomFooter}
            pagination
          />
        );

        expect(wrapper.find(CustomFooter)).to.have.lengthOf(1);
        expect(wrapper.find(PaginationFooter)).to.have.lengthOf(1);
        expect(wrapper.find(Pagination)).to.have.lengthOf(1);
        expect(
          wrapper.containsMatchingElement(<button>Click here</button>)
        ).to.equal(true);
      });
    });
  });
}
