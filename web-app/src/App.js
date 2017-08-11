import React from "react";
import {BrowserRouter} from "react-router-dom";
import {FetchProvider} from "./comps/Fetch";
import Loader from "./comps/Loader";
import Ui from "./comps/Ui";

const HasSlackTeam = ({data, children}) =>
  data.hasSlackTeam
    ? children
    : <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
        <Ui.TextButton
          href={`https://slack.com/oauth/authorize?&client_id=${process.env
            .REACT_APP_SLACK_CLIENT_ID}&scope=channels:history`}
        >
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </Ui.TextButton>
      </Ui.FullHeight>;

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <FetchProvider>
          <Loader url="/public/home">
            {data =>
              <HasSlackTeam data={data}>
                <div>Saftladen Dashboard</div>
              </HasSlackTeam>}
          </Loader>
        </FetchProvider>
      </BrowserRouter>
    );
  }
}
