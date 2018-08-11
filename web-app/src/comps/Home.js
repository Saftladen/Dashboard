import React from "react";
import {Redirect} from "react-router-dom";
import Ui from "./Ui";
import qs from "qs";
import * as auth from "../lib/auth";
import AuthBar from "./AuthBar";
import TileManager from "./TileManager";
import ConnectLoader from "./Loader";
import gql from "fraql";

const HasSlackTeam = ({data, children}) =>
  data.slackTeams.totalCount > 0 ? (
    children
  ) : (
    <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
      <Ui.RawButton
        href={`https://slack.com/oauth/authorize?&client_id=${
          process.env.REACT_APP_SLACK_CLIENT_ID
        }&scope=channels:history&state=team`}
      >
        <img
          alt="Add to Slack"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          css={{display: "block"}}
        />
      </Ui.RawButton>
    </Ui.FullHeight>
  );

const HomeQuery = gql`
  query {
    slackTeams: allIntegrations(condition: {type: SLACK_TEAM}) {
      totalCount
    }
    currentUser {
      name
    }
  }
`;

const Home = ({location}) => {
  const q = qs.parse(location.search, {ignoreQueryPrefix: true});
  if (q && q.authToken) {
    auth.setToken(q.authToken);
    return <Redirect to="/" />;
  } else {
    return (
      <ConnectLoader query={HomeQuery}>
        {(style, data) => (
          <HasSlackTeam data={data}>
            <Ui.FullHeight style={style}>
              <AuthBar data={data} />
              <TileManager data={data} />
            </Ui.FullHeight>
          </HasSlackTeam>
        )}
      </ConnectLoader>
    );
  }
};

export default Home;
