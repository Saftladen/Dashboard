import React from "react";
import styled from "react-emotion";
import Ui from "./Ui";
import AuthBar, {SigninWithSlack} from "./AuthBar";
import ConnectLoader from "./Loader";
import gql from "graphql-tag";
import ActionButton from "./ActionButton";
import {Value, Toggle} from "react-powerplug";
import {AddCountdown, UpdateCountdown} from "./manage/Countdown";

const addInfo = [
  {
    label: "Countdown",
    AddForm: AddCountdown,
  },
];

const AdderArea = () => (
  <Value initial={null}>
    {({value, set}) => (
      <React.Fragment>
        <Ui.Row css={{marginBottom: "1em"}}>
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
          <div css={{margin: "0 0 2em"}}>
            <value.AddForm onFinish={() => set(null)} />
          </div>
        )}
      </React.Fragment>
    )}
  </Value>
);

const OverviewContainer = styled("div")({
  borderLeft: "0.25em solid rgba(255,255,255,0.2)",
  paddingLeft: "1em",
  display: "flex",
  alignItems: "flex-start",
  "&:not(:last-child)": {marginBottom: "1em"},
});

const ActionArea = styled("div")({
  marginLeft: "auto",
  flex: "none",
});

const OverviewTile = ({type, label, children, deleteAction, updateComp}) => (
  <Toggle>
    {({on: isEditing, toggle, set}) => (
      <OverviewContainer>
        {isEditing ? (
          <div css={{flex: "auto"}}>{updateComp(() => set(false))}</div>
        ) : (
          <div>
            <Ui.Row
              css={{
                alignItems: "baseline",
                fontSize: "1.2em",
                marginBottom: children ? "0.2em" : null,
              }}
            >
              <div css={{textTransform: "uppercase", fontSize: "0.8em"}}>{type}</div>
              {label && <div css={{fontWeight: "bold", marginLeft: "0.5em"}}>{label}</div>}
            </Ui.Row>
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
  COUNTDOWN: ({data: {countdown}}) => (
    <OverviewTile
      type="Countdown"
      label={countdown.label}
      deleteAction={{
        mutationName: "deleteCountdown",
        inputType: "DeleteCountdownInput",
        data: {id: countdown.id},
      }}
      updateComp={onFinish => <UpdateCountdown countdown={countdown} onFinish={onFinish} />}
    >
      ends at: {countdown.endsAt}
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
  maxWidth: 1000,
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
      type
      countdown {
        id
        endsAt
        label
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
        marginBottom: "1em",
      }}
    >
      You're not logged in
    </div>
    <SigninWithSlack height="1.5em" />
  </Ui.FullHeight>
);

const Admin = () => (
  <ConnectLoader query={AdminQuery}>
    {(style, data) => (
      <Container style={style}>
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
