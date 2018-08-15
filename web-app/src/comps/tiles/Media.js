import React from "react";
import styled from "react-emotion";

const ImageContainer = styled("div")({width: "100%", height: "100%"}, ({url}) => ({
  backgroundImage: `url('${url}')`,
}));

const Label = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "2em 1em 0.5em",
  textAlign: "center",
  background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0.5) 100%)",
});

const Media = ({data: {media}}) => (
  <ImageContainer url={media.url}>
    <Label>{media.label}</Label>
  </ImageContainer>
);

export default Media;
