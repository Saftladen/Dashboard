import React from "react";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import {ComponentLoader} from "./comps/Loader";
import {Provider, Client} from "urql";
import {getToken} from "./lib/auth";

const renderAsyncRoute = comp => props => <ComponentLoader comp={comp} props={props} />;

const client = new Client({
  url: `${process.env.REACT_APP_API_URL}/graphql`,
  fetchOptions: () => ({
    headers: {
      ...(getToken() ? {"x-auth-token": getToken()} : null),
      "content-type": "application/json;charset=UTF-8",
    },
  }),
});

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Provider client={client}>
          <Switch>
            <Route
              path="/"
              exact
              component={renderAsyncRoute(import(/* webpackChunkName: 'Home' */ "./comps/Home"))}
            />
            <Route
              path="/admin"
              exact
              component={renderAsyncRoute(import(/* webpackChunkName: 'Admin' */ "./comps/Admin"))}
            />
            <Route render={() => <h1>404</h1>} />
          </Switch>
        </Provider>
      </BrowserRouter>
    );
  }
}
