import React from "react";
import styled from "react-emotion";
import Ui from "./Ui";
import gql from "graphql-tag";

const bgStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  color: "rgba(255, 255, 255, 0.7)",
  padding: "0.4em 0.8em",
  fontSize: 11,
  borderBottomLeftRadius: "0.2em",
};

const AuthBarContainer = styled("div")({
  position: "absolute",
  top: 0,
  right: 0,
  zIndex: 2,
});

export const SigninWithSlack = ({height = "1.5em", css}) => (
  <a
    href={`https://slack.com/oauth/authorize?&client_id=${
      process.env.REACT_APP_SLACK_CLIENT_ID
    }&scope=identity.basic,identity.avatar&state=user`}
    css={{
      ...css,
      display: "block",
    }}
  >
    <img
      alt="Sign in with Slack"
      src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
      srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
      css={{
        height,
        display: "block",
      }}
    />
  </a>
);

class AuthBar extends React.PureComponent {
  render() {
    const {
      data: {currentUser},
    } = this.props;
    return (
      <AuthBarContainer>
        {currentUser ? (
          <Ui.RawButton to="/admin" css={bgStyle}>
            <div
              css={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                alt={currentUser.name}
                src={currentUser.integrationData.avatarUrl}
                css={{
                  height: "1em",
                  borderRadius: "50%",
                }}
              />
              <div css={{marginLeft: "0.4em", fontWeight: "bold"}}>{currentUser.name}</div>
            </div>
          </Ui.RawButton>
        ) : (
          <SigninWithSlack height="1em" css={bgStyle} />
        )}
      </AuthBarContainer>
    );
  }
}

AuthBar.fragment = gql`
  fragment AuthBarQuery on Query {
    currentUser {
      id
      name
      integrationData {
        id
        avatarUrl
      }
    }
  }
`;

export default AuthBar;
