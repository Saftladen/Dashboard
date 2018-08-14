const createMutation = (name, inputType) => ({
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: {kind: "Name", value: name},
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {kind: "Variable", name: {kind: "Name", value: "input"}},
          type: {
            kind: "NonNullType",
            type: {kind: "NamedType", name: {kind: "Name", value: inputType}},
          },
        },
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: {kind: "Name", value: name},
            arguments: [
              {
                kind: "Argument",
                name: {kind: "Name", value: "input"},
                value: {kind: "Variable", name: {kind: "Name", value: "input"}},
              },
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {kind: "Field", name: {kind: "Name", value: "id"}, arguments: [], directives: []},
              ],
            },
          },
        ],
      },
    },
  ],
  loc: {
    start: 0,
    end: 120,
    source: {
      body:
        "\n  mutation addCountdown($input: AddCountdownInput!) {\n    addCountdown(input: $input) {\n      id\n      label\n    }\n  }\n",
      name: "GraphQL request",
      locationOffset: {line: 1, column: 1},
    },
  },
});
export default createMutation;
