import React from "react";
import {Value} from "react-powerplug";
import Input from "./Input";
import getValue from "get-value";
import Ui from "./Ui";
// import styled from "react-emotion";

const postData = (data, set) => {
  fetch(`${process.env.REACT_APP_API_URL}/test-number`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        return Promise.reject({status: data.statusCode, error: data.error, message: data.message});
      }
      set(data);
    })
    .catch(e => {
      if (e.status) {
        set({status: e.status, error: `${e.error} - ${e.message}`});
      } else {
        set({status: "unknown", error: e.toString()});
      }
    });
};

const TestNumber = ({data, data: {url, valueExtractor}}) => (
  <Value initial={{}}>
    {({value, set}) => (
      <div css={{marginBottom: "1rem"}}>
        {value.error && (
          <div>
            error: <b>{value.error}</b>
          </div>
        )}
        <Ui.BorderButton disabled={!url} onClick={() => postData(data, set)}>
          Get Data
        </Ui.BorderButton>
        {value.data && (
          <React.Fragment>
            <div css={{margin: "1rem 0 0.5rem"}}>
              Status: <b>{value.status}</b>
            </div>
            <Input
              type="textarea"
              maxRows={15}
              value={JSON.stringify(value.data, null, 2)}
              readOnly
            />
            {value.status < 400 &&
              valueExtractor && (
                <Value initial={null}>
                  {({value: extractVal, set}) => (
                    <React.Fragment>
                      <Ui.BorderButton
                        css={{marginTop: "0.5rem"}}
                        onClick={() => {
                          set(getValue(value.data, valueExtractor));
                        }}
                      >
                        Extract <code>{valueExtractor}</code>
                      </Ui.BorderButton>
                      {extractVal !== null && (
                        <div css={{marginTop: "0.5rem"}}>
                          extracted:{" "}
                          <code css={{fontSize: "1.5rem"}}>{JSON.stringify(extractVal)}</code>
                        </div>
                      )}
                    </React.Fragment>
                  )}
                </Value>
              )}
          </React.Fragment>
        )}
      </div>
    )}
  </Value>
);

export default TestNumber;
