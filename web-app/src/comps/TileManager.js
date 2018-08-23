import React from "react";
import styled from "react-emotion";
import Countdown from "./tiles/Countdown";
import gql from "graphql-tag";
import Media from "./tiles/Media";
import TwitterUser from "./tiles/TwitterUser";
import buildGrid from "grid-distribute";

const Container = styled("div")({
  position: "relative",
  width: "100vw",
  height: "100vh",
});

const Tile = styled("div")(
  {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  ({rect, totalRows, totalCols}) => {
    const wUnit = (1 / totalCols) * 100;
    const hUnit = (1 / totalRows) * 100;
    return {
      fontSize: `${(rect.height * hUnit) / 2}px`,
      top: `${rect.top * hUnit}%`,
      left: `${rect.left * wUnit}%`,
      height: `${rect.height * hUnit}%`,
      width: `${rect.width * wUnit}%`,
    };
  }
);

const CompsByType = {
  COUNTDOWN: Countdown,
  MEDIA: Media,
  TWITTER_USER: TwitterUser,
};

const getComponent = p => {
  const Comp = CompsByType[p.type];
  return Comp ? <Comp data={p} /> : <div>Unknown Tile of type {p.type}</div>;
};

class TileManager extends React.PureComponent {
  constructor(props) {
    super(props);
    this.grid = buildGrid({width: 4, height: 3});
  }

  render() {
    const {data} = this.props;
    if (!data.topPlacements.length) return "no tiles yet";

    const placementWithPositions = this.grid.distribute({
      elements: data.topPlacements,
      getPriority: pl => pl.currentScore,
    });

    return (
      <Container>
        {placementWithPositions.map(({element, position}) => (
          <Tile key={element.id} rect={position} totalRows={3} totalCols={4}>
            {getComponent(element)}
          </Tile>
        ))}
      </Container>
    );
  }
}

TileManager.fragment = gql`
  fragment TileManagerQuery on Query {
    topPlacements(first: 12) {
      id
      currentScore
      isPrivate
      type
      countdown {
        id
        endsAt
        label
      }
      media {
        id
        label
        url
        type
      }
      twitterUser {
        id
        username
        lastTweetData
      }
    }
  }
`;

export default TileManager;
