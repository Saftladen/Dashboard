import {Formik, Form as FormikForm, FastField as FormikField} from "formik";
import React from "react";
import {getToken} from "../lib/auth";
import Input from "./Input";
import spected from "spected";
import Ui from "./Ui";

const send = (to, data) =>
  fetch(`${process.env.REACT_APP_API_URL}/action/${to}`, {
    method: "post",
    body: JSON.stringify(data),
    headers: getToken() ? {"x-auth-token": getToken()} : {},
  }).then(
    e => {
      if (this.unmounted) return;
      if (e.ok) {
        return e.json();
      } else {
        e.json()
          .catch(e => Promise.reject({error: e}))
          .then(jsonRes =>
            Promise.reject({error: jsonRes.error || jsonRes.message || JSON.stringify(jsonRes)})
          );
      }
    },
    e => {
      console.error(e);
      return Promise.reject({error: e.message});
    }
  );

export const Form = ({onSubmitSend, children, rules, ...rest}) => (
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
      send(onSubmitSend.to, onSubmitSend.data(values)).then(
        v => {
          actions.setSubmitting(false);
          return v;
        },
        e => {
          actions.setSubmitting(false);
          actions.setErrors(e.error || e.toString());
          return Promise.reject(e);
        }
      );
    }}
    {...rest}
  >
    {p => <FormikForm>{children(p)}</FormikForm>}
  </Formik>
);

export const FormWithButton = ({buttonLabel, children, ...rest}) => (
  <Form {...rest}>
    {p => (
      <React.Fragment>
        {children(p)}
        <Ui.FullButton type="submit" disabled={p.isSubmitting}>
          Create Countdown
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
