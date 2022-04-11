import "../client/main.less";
import { I18nextProvider } from "react-i18next";
import i18n from "../imports/client/services/translations/i18n.js";
import { MemoryRouter, Route } from "react-router";
import { addParameters } from "@storybook/react";
import { DocsPage, DocsContainer } from "@storybook/addon-docs";
import { regiterPath, setCurrentRoute } from "./mocks/routes-helpers";
import { MockedProvider } from "@apollo/client/testing";

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

// in case the story requires a route parameter, pass in a rout object in the args
export const decorators = [
  storyFn => <I18nextProvider i18n={i18n}>{storyFn()}</I18nextProvider>,
  (storyFn, context) => {
    const { router } = context.args;
    const { pathName = "MOCKED_PATH", pathAlias = "MOCKED_ALIAS" } =
      router || {};
    regiterPath(pathName, pathAlias);
    // setCurrentRoute(pathName);

    if (!router) {
      return <MemoryRouter initialEntries={["/"]}>{storyFn()}</MemoryRouter>;
    } else {
      return (
        <MemoryRouter initialEntries={[router.pathName]}>
          <Route component={() => storyFn()} path={router.pathAlias} />
        </MemoryRouter>
      );
    }
  },
  (storyFn, context) => {
    const { mocks, link } = context?.args || {};
    return (
      <MockedProvider mocks={mocks} link={link} addTypename={false}>
        {storyFn()}
      </MockedProvider>
    );
  }
];
