import React from "react";
import { Container } from "semantic-ui-react";

const AsideWrapper = ({ aside }) => (
  <aside className="expanded">
    <a className="ui left floated icon minimize" style={{ cursor: "pointer" }}>
      <i aria-hidden="true" className="angle right large icon" />
    </a>
    <div className="content">
      <div>{aside}</div>
    </div>
  </aside>
);

const PageHolder = ({ main, children, aside }) => (
  <>
    <div className="app">
      <div className="contentContainer">
        <div>
          <main className={main}>
            <Container fluid>{children}</Container>
          </main>
          {aside ? <AsideWrapper aside={aside} /> : null}
        </div>
      </div>
    </div>
  </>
);

export default PageHolder;
