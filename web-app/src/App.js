import React from "react";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import {ComponentLoader} from "./comps/Loader";
import {getToken} from "./lib/auth";
import ApolloClient from "apollo-boost";
import {ApolloProvider} from "react-apollo";

const renderAsyncRoute = comp => props => <ComponentLoader comp={comp} props={props} />;

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}/graphql`,
  request: operation => {
    const token = getToken();
    if (token) {
      operation.setContext({headers: {"x-auth-token": token}});
    }
  },
});

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={client}>
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
        </ApolloProvider>
      </BrowserRouter>
    );
  }
}
