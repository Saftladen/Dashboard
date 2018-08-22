import React from "react";
import styled from "react-emotion";
import Ui from "../Ui";

const getTweetText = data => {
  const {display_text_range: r, full_text} = data;
  const children = [...full_text] // to seperate by real characters including emojis, etc
    .slice(r[0], r[1])
    .join("")
    .split("\n")
    .reduce((m, next) => {
      if (m.length) m.push(<br />);
      m.push(<span>{next}</span>);
      return m;
    }, []);
  return React.createElement(React.Fragment, {}, ...children);
};

const TweetText = styled("div")({
  fontSize: "0.9em",
});

const InnerMedia = ({media: {media_url_https, type}}) => {
  if (type === "photo") {
    return <img css={{maxHeight: "100%"}} src={media_url_https} alt="Twitter Media" />;
  } else if (type === "video") {
    return <video css={{maxHeight: "100%"}} src={media_url_https} />;
  } else {
    return <div>unknown media type: {type}</div>;
  }
};

const Media = ({media}) => (
  <div css={{flex: "auto", marginBottom: "0.5em"}}>
    <InnerMedia media={media} />
  </div>
);

const UserName = styled("div")({
  fontWeight: "bold",
  marginBottom: "0.5em",
});

const Outer = styled(Ui.Col)({
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  padding: "0.5em",
});

const TwitterUser = ({
  data: {
    twitterUser: {username, lastTweetData: data},
  },
}) => (
  <Outer>
    <UserName>@{username}</UserName>
    {data.entities.media &&
      data.entities.media.length > 0 && (
        <Ui.Row>
          {data.entities.media.map(m => (
            <Media key={m.url} media={m} />
          ))}
        </Ui.Row>
      )}
    <TweetText>{getTweetText(data)}</TweetText>
  </Outer>
);

export default TwitterUser;
