import React from "react";
import styled from "react-emotion";
import {Sparklines, SparklinesLine} from "react-sparklines";
import Color from "color";

const Label = styled("div")({
  fontWeight: "bold",
  fontSize: "0.8em",
});
const NumberContainer = styled("div")({
  fontSize: "1.2em",
});

const ShowNumber = ({data: {showNumber, color}}) => (
  <div css={{textAlign: "center", width: "100%", padding: "1em"}}>
    <Label>{showNumber.label}</Label>
    <NumberContainer>{showNumber.lastData}</NumberContainer>
    {showNumber.data.length > 2 && (
      <Sparklines data={[...showNumber.data].reverse()} width={300} height={60}>
        <SparklinesLine
          color={Color(color)
            .mix(Color("#fff"), 0.7)
            .toString()}
        />
      </Sparklines>
    )}
  </div>
);

export default ShowNumber;
