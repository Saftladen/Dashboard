import React from "react";
import gql from "graphql-tag";
import {Subscription} from "react-apollo";
import {ApolloConsumer} from "react-apollo";

class CallIfChanged extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) this.props.apply();
  }

  render() {
    return null;
  }
}

const SubscriptionQuery = gql`
  subscription {
    dataChanged {
      version
    }
  }
`;

const ReloadOnNewData = () => (
  <ApolloConsumer>
    {client => (
      <Subscription subscription={SubscriptionQuery}>
        {({data, loading}) => (
          <CallIfChanged
            value={data ? data.dataChanged.version : null}
            apply={() => client.resetStore()}
          />
        )}
      </Subscription>
    )}
  </ApolloConsumer>
);

export default ReloadOnNewData;
