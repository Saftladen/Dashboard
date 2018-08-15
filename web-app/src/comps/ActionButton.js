import React from "react";
import Ui from "./Ui";
import createMutation from "../lib/mutation-gql-ast";
import {Mutation} from "react-apollo";

const ActionButton = ({data, mutationName, inputType, ...rest}) => (
  <Mutation mutation={createMutation(mutationName, inputType)}>
    {(mutate, {client, loading}) => (
      <Ui.TextButton
        disabled={loading}
        onClick={() => {
          mutate({variables: {input: data}}).then(v => {
            client.resetStore();
          });
        }}
        {...rest}
      />
    )}
  </Mutation>
);

export default ActionButton;
