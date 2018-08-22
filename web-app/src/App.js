import React from "react";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import {ComponentLoader} from "./comps/Loader";
import {getToken} from "./lib/auth";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {HttpLink} from "apollo-link-http";
import {onError} from "apollo-link-error";
import {ApolloLink, Observable} from "apollo-link";
import {ApolloProvider} from "react-apollo";
import {WebSocketLink} from "apollo-link-ws";
import {split} from "apollo-link";
import {getMainDefinition} from "apollo-utilities";
import ReloadOnNewData from "./comps/ReloadOnNewData";

const request = async operation => {
  const token = getToken();
  if (token) {
    operation.setContext({headers: {"x-auth-token": token}});
  }
};

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle;
      Promise.resolve(operation)
        .then(oper => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

const httpLink = new HttpLink({
  uri: `${process.env.REACT_APP_API_URL}/graphql`,
});
const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_SUBSCRIPTIONS_URL,
  options: {
    reconnect: true,
  },
});

const finalLink = split(
  // split based on operation type
  ({query}) => {
    const {kind, operation} = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const link = ApolloLink.from([
  onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors)
      graphQLErrors.map(({message, locations, path}) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  requestLink,
  finalLink,
]);

const client = new ApolloClient({link, cache: new InMemoryCache()});

const renderAsyncRoute = comp => props => <ComponentLoader comp={comp} props={props} />;

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ApolloProvider client={client}>
          <ReloadOnNewData />
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
