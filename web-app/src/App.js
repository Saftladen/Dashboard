import React from "react";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import {FetchProvider} from "./comps/Fetch";
import {ComponentLoader} from "./comps/Loader";

const renderAsyncRoute = comp => props => <ComponentLoader comp={comp} props={props} />;

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <FetchProvider>
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
        </FetchProvider>
      </BrowserRouter>
    );
  }
}
