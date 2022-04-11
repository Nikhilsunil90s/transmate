/* eslint-disable jsx-a11y/anchor-has-content */
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Trans } from "react-i18next";

import { Segment, List, Button, Icon } from "semantic-ui-react";

const IconSegment = ({
  className = "very padded",
  loading = false,
  name,
  icon = "file",
  hideIcon,
  title,
  body,
  footer,
  footerElement,
  headerButton,
  children,
  onHeaderButtonClick,
  headerContent
}) => {
  return (
    <Segment className={classNames(className, name)} as="section" loading={loading}>
      <a id={name} />
      <List>
        <List.Item>
          {!hideIcon && <List.Icon name={icon} />}
          <List.Content data-test="sectionContent">
            {title && (
              <h3 className="section-header">
                {title}
                {headerButton && <Icon onClick={onHeaderButtonClick} name="add circle" />}
                {headerContent}
              </h3>
            )}
            {body || children}
          </List.Content>
        </List.Item>
      </List>
      {footer && <Segment as="footer">{footer}</Segment>}
      {footerElement}
    </Segment>
  );
};

IconSegment.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  name: PropTypes.string,
  hideIcon: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  body: PropTypes.element,
  footer: PropTypes.oneOfType([PropTypes.element, PropTypes.array, PropTypes.number])
};

const SegmentFooter = ({ btnText = "edit", onClick }) => (
  <Segment as="footer">
    <Button as="a" basic primary onClick={onClick}>
      {btnText}
    </Button>
  </Segment>
);

SegmentFooter.propTypes = {
  btnText: PropTypes.string,
  onClick: PropTypes.func
};

const SegmentToggleEditFooter = ({ isEditing, toggleEditing, onSave }) => (
  <Segment as="footer">
    {isEditing ? (
      <div>
        <Button
          primary
          content={<Trans i18nKey="form.save" />}
          onClick={onSave}
          data-test="saveBtn"
        />
        <Button
          basic
          primary
          content={<Trans i18nKey="form.cancel" />}
          onClick={() => toggleEditing(false)}
          data-test="cancelBtn"
        />
      </div>
    ) : (
      <>
        <div />
        <Button
          primary
          basic
          content={<Trans i18nKey="form.edit" />}
          onClick={() => toggleEditing(true)}
          data-test="toggleEdit"
        />
      </>
    )}
  </Segment>
);

export { IconSegment, SegmentFooter, SegmentToggleEditFooter };
