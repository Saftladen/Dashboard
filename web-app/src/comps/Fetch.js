import React from "react";
import PropTypes from "prop-types";
import MiniEvent from "../lib/mini-event";
import * as auth from "../lib/auth";

const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    error.status = response.status;
    throw error;
  }
};

export class FetchProvider extends React.Component {
  static childContextTypes = {
    fetcher: PropTypes.object,
  };

  state = {
    errorState: null,
    loadCount: 0,
  };

  getChildContext() {
    return {
      fetcher: {
        register: this.register,
        getInitialResult: this.initialResult,
        clearCache: this.clearCache,
        errorState: this.state.errorState,
        isLoading: this.state.loadCount > 0,
      },
    };
  }

  cache = {};
  listeners = {};

  clearCache = cb => {
    this.setState({errorState: null}, cb);
    Object.keys(this.cache).forEach(url => {
      this.cache[url].isInvalid = true;
      if (this.listeners[url].isSomeoneListening()) this.listeners[url].emit(this.fetch(url));
    });
  };

  initialResult = url => {
    const cacheEntry = this.cache[url];
    return {isLoading: true, result: (cacheEntry && cacheEntry.result) || null, error: null};
  };

  register = (url, cb) => {
    const unsub = (this.listeners[url] = this.listeners[url] || new MiniEvent()).addListener(cb);
    this.fetch(url);
    return unsub;
  };

  fetch = url => {
    const cacheEntry = this.cache[url];
    if (
      cacheEntry === undefined ||
      (cacheEntry !== undefined && cacheEntry.isInvalid && !cacheEntry.isLoading)
    ) {
      this.cache[url] = {
        isLoading: true,
        result: (cacheEntry && cacheEntry.result) || null,
        error: null,
      };
      this.setState(s => ({loadCount: s.loadCount + 1}));
      fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        headers: auth.getToken() ? {"x-auth-token": auth.getToken()} : {},
      })
        .then(checkStatus)
        .then(res => res.json().then(jsonRes => ({isLoading: false, result: jsonRes, error: null})))
        .catch(err => {
          const errorMessage = err.message || `failed to fetch '${url}'`;
          this.setState({errorState: {message: errorMessage, status: err.status}});
          return {isLoading: false, result: null, error: errorMessage};
        })
        .then(res => {
          this.setState(s => ({loadCount: s.loadCount - 1}));
          this.cache[url] = res;
          this.listeners[url].emit(this.cache[url]);
        });
    }
    return this.cache[url];
  };

  render() {
    return this.props.children;
  }
}

export default class Fetch extends React.Component {
  static contextTypes = {
    fetcher: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    if (props.url) {
      this.state = context.fetcher.getInitialResult(props.url);
    } else {
      this.state = {isLoading: true, result: null, error: null};
    }
  }

  componentDidMount() {
    if (this.props.url) {
      this.unsub = this.context.fetcher.register(this.props.url, this.setResult);
    }
  }

  componentWillReceiveProps(nextProps, context) {
    if (nextProps.url !== this.props.url) {
      if (this.unsub) this.unsub();
      if (nextProps.url) {
        this.state = context.fetcher.getInitialResult(nextProps.url);
        this.unsub = context.fetcher.register(nextProps.url, this.setResult);
      } else {
        this.setState({isLoading: true, result: null, error: null});
        this.unsub = null;
      }
    }
  }

  componentWillUnmount() {
    if (this.unsub) this.unsub();
  }

  setResult = result => {
    this.setState(result);
  };

  render() {
    const {isLoading, result, error} = this.state;
    const {fetcher: {clearCache}} = this.context;
    return this.props.children({isLoading, data: result, error, clearCache});
  }
}

export class FetchError extends React.Component {
  static contextTypes = {
    fetcher: PropTypes.object,
  };

  render() {
    const {fetcher: {errorState}} = this.context;
    return errorState && this.props.children(errorState);
  }
}

export class FetchLoading extends React.Component {
  static contextTypes = {
    fetcher: PropTypes.object,
  };

  render() {
    const {fetcher: {isLoading}} = this.context;
    return isLoading && this.props.children();
  }
}
