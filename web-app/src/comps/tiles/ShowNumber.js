import React from "react";
import styled from "react-emotion";
import {Sparklines, SparklinesLine} from "react-sparklines";
import colors from "../../lib/colors";

const Label = styled("div")({
  fontWeight: "bold",
  fontSize: "0.8em",
});
const NumberContainer = styled("div")({
  fontSize: "1.2em",
});

const ShowNumber = ({data: {showNumber}}) =>
  console.log("showNumber.data.length", showNumber.data.length) || (
    <div css={{textAlign: "center", width: "100%", padding: "1em"}}>
      <Label>{showNumber.label}</Label>
      <NumberContainer>{showNumber.lastData}</NumberContainer>
      {showNumber.data.length > 2 && (
        <Sparklines data={[...showNumber.data].reverse()} width={300} height={60}>
          <SparklinesLine color={colors.brand} />
        </Sparklines>
      )}
    </div>
  );

export default ShowNumber;
