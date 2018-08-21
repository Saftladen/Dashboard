import React from "react";
import styled from "react-emotion";

const getTweetText = data => {
  const {display_text_range: r, full_text} = data;
  const children = full_text
    .slice(r[0], r[1])
    .split("\n")
    .reduce((m, next) => {
      if (m.length) m.push(<br />);
      m.push(next);
      return m;
    }, []);
  return React.createElement(React.Fragment, {}, ...children);
};

const TweetText = styled("div")({});

const TwitterUser = ({
  data: {
    twitterUser: {username, lastTweetData: data},
  },
}) =>
  console.log("data", data) || (
    <div>
      <TweetText>{getTweetText(data)}</TweetText>@{username}
    </div>
  );

export default TwitterUser;
