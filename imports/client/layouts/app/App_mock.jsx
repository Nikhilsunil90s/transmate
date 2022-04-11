import React, { useState, useEffect, Suspense } from "react";
import browserCheck from "ua-parser-js";
import { ToastContainer } from "react-toastify";

import PropTypes from "prop-types";
import { Sidebar, Menu, Icon } from "semantic-ui-react";
import classNames from "classnames";
import { Emitter, Events } from "/imports/client/services/events";
import { SearchHeader, UserMenu, NotificationsHeader, QuickActions } from "../../components/header";
import NavBar from "../../components/layout/NavBar";

import ErrorBoundary from "/imports/client/components/utilities/ErrorBoundery";
import LoadingBlock from "/imports/client/components/utilities/LoadingPlaceholder";
import "react-toastify/dist/ReactToastify.css";

const debug = require("debug")("UI:root");

const AppLayoutMock = ({ ...props }) => {
  const {
    asideCollapsed,
    account,
    sidebar,
    noGeneralSearch,
    header,
    headerData,
    name,
    main,
    aside,
    activeRoute // mock variable
  } = props;

  // debug("main app ", props);
  const [asideExpanded, setAsideExpanded] = useState(!asideCollapsed);
  const [searching, setSearching] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);

  // eslint-disable-next-line new-cap
  const isIE = new browserCheck().getEngine().name === "Trident";

  // const activeRoute = FlowRouter.current().route.name;
  const accountFeatures = account?.features || [];

  function toggleAside() {
    setAsideExpanded(!asideExpanded);
  }

  // toggle side panel
  useEffect(() => {
    Emitter.on(Events.TOGGLE_SIDE_PANEL, () => {
      debug("side panel toggled");
      setShowSideBar(!showSideBar);
    });
    return () => Emitter.off(Events.TOGGLE_SIDE_PANEL);
  });

  return (
    <ErrorBoundary>
      <Sidebar
        width="very wide"
        direction="right"
        animation="overlay"
        visible={showSideBar}
        onHide={() => setShowSideBar(false)}
      >
        {sidebar ? <Suspense fallback={<LoadingBlock />}>{sidebar}</Suspense> : null}
      </Sidebar>
      <Sidebar.Pusher>
        <div className="app">
          {isIE && "get modern browser"}
          <header className={classNames({ searching })}>
            <a className="logo" href="/">
              <img src="/images/logo-transmate-t.svg" alt="logo" />
            </a>
            {!noGeneralSearch && <SearchHeader setSearching={setSearching} />}
            {header && React.cloneElement(header, { ...headerData })}
            <Menu className="user" compact>
              {/* {{> HeaderTasks}}
              {{> HeaderConversations}} */}

              <QuickActions />
              <NotificationsHeader />
              <UserMenu {...props} />
            </Menu>
          </header>
          <NavBar {...{ activeRoute, accountFeatures }} />
          <div className="contentContainer">
            {/* scroll container */}
            <div>
              {/* flex container — for equal column height */}
              <ErrorBoundary>
                <Suspense fallback={<LoadingBlock />}>
                  <main className={name}>{main && <div>{main}</div>}</main>

                  {aside && (
                    <aside
                      className={classNames({ expanded: asideExpanded, minimized: !asideExpanded })}
                    >
                      {asideExpanded ? (
                        <a
                          className="ui left floated icon minimize"
                          onClick={toggleAside}
                          style={{ cursor: "pointer" }}
                        >
                          <Icon name="angle right" size="large" />
                        </a>
                      ) : (
                        <a
                          className="ui center floated icon minimize"
                          onClick={toggleAside}
                          style={{ cursor: "pointer" }}
                        >
                          <Icon name="angle left" size="large" />
                        </a>
                      )}
                      <div style={asideExpanded ? {} : { display: "none" }} className="content">
                        {aside}
                      </div>
                    </aside>
                  )}
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
          />
        </div>
      </Sidebar.Pusher>
    </ErrorBoundary>
  );
};

// const AppLayoutLoader = ({ ...props }) => {
//   // get user info -> subscription + fetch
//   // get account info -> subscription + fetch
//   // get account settings
//   const { data = {}, loading, error } = useQuery(APP_ROOT_QUERY);

//   if (error) console.error(error);
//   debug("data %o", data);

//   return loading ? (
//     <div>Loading .... </div>
//   ) : (
//     <LoginProvider
//       value={{
//         account: data.account,
//         accountId: data.account?.id,
//         user: data.currentUser,
//         userId: data.currentUser?.id,
//         roles: data.currentUser?.roles || [],
//         entities: data.currentUser?.entities || []
//       }}
//     >
//       <AppLayout {...props} {...data} />
//     </LoginProvider>
//   );
// };

AppLayoutMock.propTypes = {
  name: PropTypes.string,
  sidebar: PropTypes.element,
  header: PropTypes.element,
  main: PropTypes.element,
  aside: PropTypes.element,
  asideCollapsed: PropTypes.bool,
  headerData: PropTypes.shape({
    back: PropTypes.string,
    title: PropTypes.string
  }), // has to be filled in already

  noGeneralSearch: PropTypes.bool
};

export default AppLayoutMock;
