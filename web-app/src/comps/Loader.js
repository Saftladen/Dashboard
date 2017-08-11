import React from "react";
import Fetch from "./Fetch";
import B from "glamorous";
import Ui from "./Ui";
import {css} from "glamor";
import {Motion, spring, presets} from "react-motion";

const rotate = css.keyframes({
  "0%": {transform: `rotate(0deg)`},
  "100%": {transform: `rotate(360deg)`},
});

const SpinContainer = B.svg(
  {
    stroke: "#ccc",
  },
  ({size}) => ({
    transform: `scale(${Math.min(3, size / 25)})`,
  })
);

const SpinG = B.g({
  strokeWidth: 2,
  transformOrigin: "50% 50%",
  fill: "none",
  animation: `${rotate} 2s infinite linear`,
});

export const Spinner = ({size = 75}) =>
  <SpinContainer size={size} width="50" height="50" viewBox="-1 -1 39 39">
    <SpinG>
      <circle strokeOpacity=".25" cx="18" cy="18" r="18" />
      <path strokeOpacity=".5" d="M36 18c0-9.94-8.06-18-18-18" />
    </SpinG>
  </SpinContainer>;

const LoaderContainer = B.div({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(50,50,50,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export class RawLoader extends React.Component {
  renderLoading(spinnerPresence) {
    if (spinnerPresence === 0) return;
    return (
      <LoaderContainer
        style={{opacity: spinnerPresence, pointerEvents: spinnerPresence > 0.3 ? "auto" : "none"}}
      >
        <Spinner />
      </LoaderContainer>
    );
  }

  renderError(err) {
    return (
      <div>
        {err.toString()}
      </div>
    );
  }

  render() {
    const {isLoading, error, children} = this.props;
    return (
      <Motion
        style={{
          spinnerPresence: spring(isLoading ? 1 : 0, presets.stiff),
        }}
      >
        {({spinnerPresence}) =>
          <Ui.FullHeight>
            {this.renderLoading(spinnerPresence)}
            {error && this.renderError(error)}
            {children &&
              <Ui.FullHeight style={{opacity: 1 - spinnerPresence}}>
                {children}
              </Ui.FullHeight>}
          </Ui.FullHeight>}
      </Motion>
    );
  }
}

export default class FetchLoader extends React.Component {
  render() {
    const {url, children} = this.props;
    return (
      <Fetch url={url}>
        {({isLoading, data, error, clearCache}) =>
          <RawLoader isLoading={isLoading} error={error}>
            {data && children(data, clearCache)}
          </RawLoader>}
      </Fetch>
    );
  }
}
