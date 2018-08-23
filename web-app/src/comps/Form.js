import {Formik, Form as FormikForm, Field as FormikField} from "formik";
import React from "react";
import Input from "./Input";
import spected from "spected";
import Ui from "./Ui";
import createMutation from "../lib/mutation-gql-ast";
import {Mutation} from "react-apollo";
import colors from "../lib/colors";

const ShowError = ({form: {errors}}) =>
  errors.$global ? (
    <div
      css={{backgroundColor: colors.danger, color: "#fff", padding: "1rem", marginBottom: "0.5rem"}}
    >
      {errors.$global}
    </div>
  ) : null;

const extractError = e => {
  if (e.networkError && e.networkError.result) {
    const {message} = e.networkError.result;
    if (Array.isArray(message.errors)) {
      return message.errors.map(innerErr => innerErr.message).join(" & ");
    } else if (message.error) {
      return message.error;
    }
  }
  if (e.error) return e.error;
  return e.toString();
};

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
              actions.setErrors({$global: extractError(e)});
              return Promise.reject(e);
            }
          );
          if (onSubmit) onSubmit(p);
        }}
        {...rest}
      >
        {p => (
          <FormikForm>
            <ShowError form={p} />
            {children(p)}
          </FormikForm>
        )}
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

const InnerField = ({component: Comp, handleRef, label, props, errors}) => {
  if (typeof Comp === "string") {
    return (
      <React.Fragment>
        <label>
          {label}
          {errors && errors.length && errors.join(", ")}
        </label>
        <Comp css={{marginBottom: "1em", display: "block"}} ref={handleRef} {...props} />
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <label>{label}</label>
        <Comp css={{marginBottom: "1em"}} innerRef={handleRef} {...props} errors={errors} />
      </React.Fragment>
    );
  }
};

export const Field = ({name, component = Input, label, ...rest}) => (
  <FormikField name={name} type={rest.type}>
    {({field, form}) => (
      <ScrollToError name={name} {...form}>
        {handleRef => (
          <InnerField
            component={component}
            handleRef={handleRef}
            label={label}
            props={{...rest, ...field}}
            errors={form.touched[name] && form.errors[name]}
          />
        )}
      </ScrollToError>
    )}
  </FormikField>
);

export const rules = {
  isRequired: [v => v === 0 || !!v, "is required"],
};
