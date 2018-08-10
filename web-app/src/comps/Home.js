import React from "react";
import {Redirect} from "react-router-dom";
import Ui from "./Ui";
import qs from "qs";
import * as auth from "../lib/auth";
import AuthBar from "./AuthBar";
import TileManager from "./TileManager";
import {Connect, query} from "urql";

const HasSlackTeam = ({data, children}) =>
  data.hasSlackTeam ? (
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

const HomeQuery = `
query {
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
      <Connect query={query(HomeQuery)}>{data => console.log("data", data) || <h1>hi</h1>}</Connect>
    );
    // return (
    //   <Loader url="/public/home">
    //     {data => (
    //       <HasSlackTeam data={data}>
    //         <Ui.FullHeight>
    //           <AuthBar data={data} />
    //           <TileManager data={data} />
    //         </Ui.FullHeight>
    //       </HasSlackTeam>
    //     )}
    //   </Loader>
    // );
  }
};

export default Home;
