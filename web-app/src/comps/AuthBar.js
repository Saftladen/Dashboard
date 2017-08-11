import React from "react";
import B from "glamorous";
import Ui from "./Ui";

const bgStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  padding: "0.4em 0.8em",
  fontSize: "0.4em",
  borderBottomLeftRadius: "0.2em",
};

const AuthBarContainer = B.div({
  position: "absolute",
  top: 0,
  right: 0,
});

export const SigninWithSlack = ({height = "1.5em", css}) =>
  <B.A
    display="block"
    href={`https://slack.com/oauth/authorize?&client_id=${process.env
      .REACT_APP_SLACK_CLIENT_ID}&scope=identity.basic,identity.avatar&state=user`}
    css={css}
  >
    <B.Img
      display="block"
      alt="Sign in with Slack"
      src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
      srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
      height={height}
    />
  </B.A>;

const AuthBar = ({data}) =>
  <AuthBarContainer>
    {data.me
      ? <Ui.RawButton to="/admin" css={bgStyle}>
          <B.Div display="flex" alignItems="center">
            <B.Img alt={data.me.name} src={data.me.avatar} height="1.2em" borderRadius="50%" />
            <B.Div marginLeft="0.4em" fontWeight="bold">
              {data.me.name}
            </B.Div>
          </B.Div>
        </Ui.RawButton>
      : <SigninWithSlack height="2em" css={bgStyle} />}
  </AuthBarContainer>;

export default AuthBar;
