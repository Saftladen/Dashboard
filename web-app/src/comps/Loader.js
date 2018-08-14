import React from "react";
import styled, {keyframes} from "react-emotion";
import Ui from "./Ui";
import {Motion, spring, presets} from "react-motion";
import {Query} from "react-apollo";

const rotate = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg);}
`;

const SpinContainer = styled("svg")(
  {
    stroke: "#ccc",
  },
  ({size}) => ({
    transform: `scale(${Math.min(3, size / 25)})`,
  })
);

const SpinG = styled("g")({
  strokeWidth: 2,
  transformOrigin: "50% 50%",
  fill: "none",
  animation: `${rotate} 2s infinite linear`,
});

export const Spinner = ({size = 75}) => (
  <SpinContainer size={size} width="50" height="50" viewBox="0 0 40 40">
    <SpinG>
      <circle strokeOpacity=".25" cx="20" cy="20" r="18" />
      <path strokeOpacity=".5" d="M38 20A18 18 0 0 0 20 2" />
    </SpinG>
  </SpinContainer>
);

const LoaderContainer = styled("div")({
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

  renderError(err, spinnerPresence) {
    return (
      <Ui.FullHeight
        style={{opacity: 1 - spinnerPresence}}
        css={{
          textAlign: "center",
          justifyContent: "center",
          padding: "2em",
          fontSize: "1.5em",
        }}
      >
        {err}
      </Ui.FullHeight>
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
        {({spinnerPresence}) => (
          <React.Fragment>
            {this.renderLoading(spinnerPresence)}
            {error && this.renderError(error, spinnerPresence)}
            {children && children({opacity: 1 - spinnerPresence})}
          </React.Fragment>
        )}
      </Motion>
    );
  }
}

export class ComponentLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedComp: null,
    };
    props.comp.then(
      c => {
        this.setState({loadedComp: c.__esModule ? c.default : c});
      },
      e => {
        this.setState({error: e.toString()});
      }
    );
  }

  state = {
    loadedComp: null,
    error: null,
  };

  render() {
    const {loadedComp: Comp, error} = this.state;
    return (
      <RawLoader isLoading={!Comp} error={error}>
        {Comp &&
          (style => <Comp {...this.props.props} style={{...style, ...this.props.props.style}} />)}
      </RawLoader>
    );
  }
}

export default class ConnectLoader extends React.Component {
  render() {
    const {query, children, onError} = this.props;
    return (
      <Query query={query}>
        {args => {
          const {loading, data, error} = args;
          return (
            <RawLoader
              isLoading={loading}
              error={
                error && onError && onError[error.status]
                  ? React.createElement(onError[error.status], {})
                  : error && (
                      <span>
                        <b>{error.status}</b> {error.message}
                      </span>
                    )
              }
            >
              {!loading && !error && (style => children(style, data))}
            </RawLoader>
          );
        }}
      </Query>
    );
  }
}
