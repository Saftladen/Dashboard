import React from "react";
import ReactDOM from "react-dom";

export default class Portal extends React.Component {
  componentWillUnmount() {
    this.tearDown();
  }

  tearDown() {
    if (!this.portal) return;
    document.body.removeChild(this.portal);
    this.portal = null;
  }

  renderPortalContents() {
    if (this.props.children) {
      if (!this.portal) {
        this.portal = document.createElement("div");
        document.body.appendChild(this.portal);
      }
      return ReactDOM.createPortal(React.Children.only(this.props.children), this.portal);
    } else {
      this.tearDown();
      return null;
    }
  }

  render() {
    const {renderInPlace} = this.props;
    return renderInPlace !== undefined ? (
      <React.Fragment>
        {renderInPlace}
        {this.renderPortalContents()}
      </React.Fragment>
    ) : (
      this.renderPortalContents()
    );
  }
}
