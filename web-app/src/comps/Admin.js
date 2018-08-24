import React from "react";
import styled from "react-emotion";
import Ui from "./Ui";
import AuthBar, {SigninWithSlack} from "./AuthBar";
import ConnectLoader from "./Loader";
import gql from "graphql-tag";
import ActionButton from "./ActionButton";
import {Value, Toggle} from "react-powerplug";
import {AddCountdown, UpdateCountdown} from "./manage/Countdown";
import {AddMedia, UpdateMedia} from "./manage/Media";
import {AddTwitterUser, UpdateTwitterUser} from "./manage/TwitterUser";
import {AddShowNumber, UpdateShowNumber} from "./manage/ShowNumber";

const addInfo = [
  {
    label: "Countdown",
    AddForm: AddCountdown,
  },
  {
    label: "Media",
    AddForm: AddMedia,
  },
  {
    label: "Twitter Users",
    AddForm: AddTwitterUser,
  },
  {
    label: "Numbers",
    AddForm: AddShowNumber,
  },
];

const AdderArea = () => (
  <Value initial={null}>
    {({value, set}) => (
      <React.Fragment>
        <Ui.Row css={{marginBottom: "1rem"}}>
          {addInfo.map(info => {
            const isActive = value === info;
            return (
              <Ui.TextButton
                key={info.label}
                active={isActive}
                onClick={() => set(isActive ? null : info)}
              >
                Add {info.label}
              </Ui.TextButton>
            );
          })}
        </Ui.Row>
        {value && (
          <div css={{margin: "0 0 2rem"}}>
            <value.AddForm onFinish={() => set(null)} />
          </div>
        )}
      </React.Fragment>
    )}
  </Value>
);

const OverviewContainer = styled("div")({
  borderLeft: "0.25rem solid rgba(255,255,255,0.2)",
  paddingLeft: "1rem",
  display: "flex",
  alignItems: "flex-start",
  "&:not(:last-child)": {marginBottom: "2rem"},
});

const ActionArea = styled("div")({
  marginLeft: "auto",
  flex: "none",
});

const OverviewTile = ({type, label, children, deleteAction, updateAction}) => (
  <Toggle>
    {({on: isEditing, toggle, set}) => (
      <OverviewContainer>
        {isEditing ? (
          <div css={{flex: "auto", marginRight: "1rem"}}>
            <updateAction.Comp {...updateAction.props} onFinish={() => set(false)} />
          </div>
        ) : (
          <div>
            <div
              css={{textTransform: "uppercase", fontSize: "0.7rem", color: "rgba(255,255,255,0.7)"}}
            >
              {type}
            </div>
            {label && (
              <div css={{fontWeight: "bold", marginBottom: "0.5rem", fontSize: "1.2rem"}}>
                {label}
              </div>
            )}
            {children}
          </div>
        )}
        <ActionArea>
          <Ui.TextButton active={isEditing} onClick={toggle}>
            Edit
          </Ui.TextButton>
          <ActionButton
            mutationName={deleteAction.mutationName}
            inputType={deleteAction.inputType}
            data={deleteAction.data}
          >
            Delete
          </ActionButton>
        </ActionArea>
      </OverviewContainer>
    )}
  </Toggle>
);

const CompByType = {
  COUNTDOWN: ({data: {countdown, isPrivate, color}}) => (
    <OverviewTile
      type="Countdown"
      label={countdown.label}
      deleteAction={{
        mutationName: "deleteCountdown",
        inputType: "DeleteCountdownInput",
        data: {id: countdown.id},
      }}
      updateAction={{
        Comp: UpdateCountdown,
        props: {data: countdown, isPrivate, color},
      }}
    >
      ends at: {countdown.endsAt}
    </OverviewTile>
  ),
  MEDIA: ({data: {media, isPrivate, color}}) => (
    <OverviewTile
      type="Media"
      label={media.label}
      deleteAction={{
        mutationName: "deleteMedia",
        inputType: "DeleteMediaInput",
        data: {id: media.id},
      }}
      updateAction={{
        Comp: UpdateMedia,
        props: {data: media, isPrivate, color},
      }}
    >
      {media.type === "IMAGE" ? (
        <img src={media.url} alt={media.label} css={{height: "5rem"}} />
      ) : (
        <div>url: {media.url}</div>
      )}
    </OverviewTile>
  ),
  TWITTER_USER: ({data: {twitterUser, isPrivate, color}}) => (
    <OverviewTile
      type="Twitter User"
      label={twitterUser.username}
      deleteAction={{
        mutationName: "deleteTwitterUser",
        inputType: "DeleteTwitterUserInput",
        data: {id: twitterUser.id},
      }}
      updateAction={{
        Comp: UpdateTwitterUser,
        props: {data: twitterUser, isPrivate, color},
      }}
    >
      {twitterUser.lastTweetData && twitterUser.lastTweetData.full_text}
    </OverviewTile>
  ),
  SHOW_NUMBER: ({data: {showNumber, isPrivate, color}}) => (
    <OverviewTile
      type="Number"
      label={showNumber.label}
      deleteAction={{
        mutationName: "deleteShowNumber",
        inputType: "DeleteShowNumberInput",
        data: {id: showNumber.id},
      }}
      updateAction={{
        Comp: UpdateShowNumber,
        props: {data: showNumber, isPrivate, color},
      }}
    >
      {showNumber.lastData && (
        <code css={{fontWeight: "bold", marginRight: "0.5rem"}}>{showNumber.lastData}</code>
      )}
      {showNumber.url}
    </OverviewTile>
  ),
};

const Overview = ({data}) => (
  <React.Fragment>
    <Ui.H1>Admin</Ui.H1>
    <AdderArea />
    <Ui.H2>Highest scoring tiles</Ui.H2>
    {data.topPlacements.map(pl => {
      const Comp = CompByType[pl.type];
      return Comp ? <Comp key={pl.id} data={pl} /> : `no comp for '${pl.type}'`;
    })}
  </React.Fragment>
);

const Container = styled("div")({
  padding: "2rem",
  maxWidth: "70rem",
  width: "100%",
  margin: "0 auto",
});

const AdminQuery = gql`
  query {
    currentUser {
      id
    }
    topPlacements(first: 12) {
      id
      currentScore
      isPrivate
      color
      type
      countdown {
        id
        endsAt
        label
      }
      media {
        id
        label
        type
        url
      }
      twitterUser {
        id
        username
        lastTweetData
      }
      showNumber {
        id
        label
        url
        method
        headers
        body
        valueExtractor
        lastData
      }
    }
    ...AuthBarQuery
  }
  ${AuthBar.fragment}
`;

const ShowLogin = () => (
  <Ui.FullHeight css={{minHeight: "100vh", alignItems: "center", justifyContent: "center"}}>
    <div
      css={{
        marginBottom: "1rem",
      }}
    >
      You're not logged in
    </div>
    <SigninWithSlack height="1.5rem" />
  </Ui.FullHeight>
);

const BackToDashboard = styled(Ui.RawButton)({
  position: "absolute",
  left: 0,
  top: 0,
  background: "rgba(255, 255, 255, 0.1)",
  color: "rgba(255, 255, 255, 0.7)",
  padding: "0.4em 0.8em",
  fontSize: 11,
  fontWeight: "bold",
  borderBottomRightRadius: "0.2em",
});

const Admin = () => (
  <ConnectLoader query={AdminQuery}>
    {(style, data) => (
      <Container style={style}>
        <BackToDashboard to="/">Back To Dashboard</BackToDashboard>
        {data.currentUser ? (
          <React.Fragment>
            <AuthBar data={data} />
            <Overview data={data} />
          </React.Fragment>
        ) : (
          <ShowLogin />
        )}
      </Container>
    )}
  </ConnectLoader>
);

export default Admin;
