import React from "react";
import * as auth from "../lib/auth";

export default class DoAction extends React.Component {
  state = {
    isLoading: false,
    error: null,
  };

  componentDidMount() {
    if (this.props.callOnMount) this.handlePerformFn();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  handlePerformFn = e => {
    if (e.preventDefault) e.preventDefault();
    const {name, data, onSuccess, onError} = this.props;
    this.setState({isLoading: true});
    fetch(`${process.env.REACT_APP_API_URL}/action/${name}`, {
      method: "post",
      body: JSON.stringify(data),
      headers: auth.getToken() ? {"x-auth-token": auth.getToken()} : {},
    }).then(
      e => {
        if (this.unmounted) return;
        if (e.ok) {
          return e.json().then(jsonRes => {
            this.setState({isLoading: false});
            if (onSuccess) onSuccess(jsonRes);
          });
        } else {
          e.json()
            .catch(e => ({error: e}))
            .then(jsonRes => {
              if (onError) {
                this.setState({isLoading: false});
                onError(e);
              } else {
                this.setState({
                  isLoading: false,
                  error: jsonRes.error || jsonRes.message || JSON.stringify(jsonRes),
                });
              }
            });
        }
      },
      e => {
        console.error(e);
        if (this.unmounted) return;
        if (onError) {
          this.setState({isLoading: false});
          onError(e);
        } else {
          this.setState({isLoading: false, error: e});
        }
      }
    );
  };

  render() {
    const {isLoading, error} = this.state;
    return this.props.children({performFn: this.handlePerformFn, isLoading, error});
  }
}
