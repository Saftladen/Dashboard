import {Formik, Form as FormikForm, Field as FormikField} from "formik";
import React from "react";
import Input from "./Input";
import spected from "spected";
import Ui from "./Ui";
import createMutation from "../lib/mutation-gql-ast";
import {Mutation} from "react-apollo";

export const Form = ({
  provideData,
  children,
  mutationName,
  inputType,
  rules,
  onSubmit,
  ...rest
}) => (
  <Mutation mutation={createMutation(mutationName, inputType)}>
    {(mutate, {client}) => (
      <Formik
        validate={
          rules
            ? values => {
                const res = spected(rules, values);
                const errors = Object.keys(res).reduce((m, key) => {
                  if (res[key] !== true) m[key] = res[key];
                  return m;
                }, {});
                return errors;
              }
            : undefined
        }
        onSubmit={(values, actions) => {
          const p = mutate({variables: {input: provideData(values)}}).then(
            v => {
              actions.setSubmitting(false);
              client.resetStore();
              return v;
            },
            e => {
              actions.setSubmitting(false);
              actions.setErrors(e.error || e.toString());
              return Promise.reject(e);
            }
          );
          if (onSubmit) onSubmit(p);
        }}
        {...rest}
      >
        {p => <FormikForm>{children(p)}</FormikForm>}
      </Formik>
    )}
  </Mutation>
);

export const FormWithButton = ({buttonLabel, children, ...rest}) => (
  <Form {...rest}>
    {p => (
      <React.Fragment>
        {typeof children === "function" ? children(p) : children}
        <Ui.FullButton type="submit" disabled={p.isSubmitting}>
          {buttonLabel}
        </Ui.FullButton>
      </React.Fragment>
    )}
  </Form>
);

class ScrollToError extends React.Component {
  handleRef = n => (this.node = n);

  componentDidUpdate(prevProps) {
    if (prevProps.submitCount !== this.props.submitCount && !this.props.isValid && this.node) {
      if (Object.keys(this.props.errors)[0] === this.props.name) {
        this.node.focus();
      }
    }
  }

  render() {
    return this.props.children(this.handleRef);
  }
}

export const Field = ({name, ...rest}) => (
  <FormikField name={name} type={rest.type}>
    {({field, form}) => (
      <ScrollToError name={name} {...form}>
        {handleRef => (
          <Input
            css={{marginBottom: "1em"}}
            innerRef={handleRef}
            {...rest}
            {...field}
            errors={form.errors[name]}
          />
        )}
      </ScrollToError>
    )}
  </FormikField>
);

export const rules = {
  isRequired: [v => v === 0 || !!v, "is required"],
};
