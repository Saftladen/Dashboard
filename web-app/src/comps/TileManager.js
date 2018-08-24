import React from "react";
import styled from "react-emotion";
import Countdown from "./tiles/Countdown";
import gql from "graphql-tag";
import Media from "./tiles/Media";
import TwitterUser from "./tiles/TwitterUser";
import buildGrid from "grid-distribute";
import ShowNumber from "./tiles/ShowNumber";

const Container = styled("div")({
  position: "relative",
  width: "100vw",
  height: "100vh",
});

const TileGradient = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1))",
});

const OuterTile = styled("div", {
  shouldForwardProp: p => ["rect", "totalRows", "totalCols", "color"].indexOf(p) === -1,
})(
  {
    position: "absolute",
    overflow: "hidden",
  },
  ({rect, totalRows, totalCols, color}) => {
    const wUnit = (1 / totalCols) * 100;
    const hUnit = (1 / totalRows) * 100;
    return {
      fontSize: `${(rect.height * hUnit) / 2}px`,
      top: `${rect.top * hUnit}%`,
      left: `${rect.left * wUnit}%`,
      height: `${rect.height * hUnit}%`,
      width: `${rect.width * wUnit}%`,
      backgroundColor: color,
    };
  }
);

const InnerTile = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  zIndex: 1,
  width: "100%",
  height: "100%",
});

const Tile = ({rect, totalRows, totalCols, color, children}) => (
  <OuterTile rect={rect} totalRows={totalRows} totalCols={totalCols} color={color}>
    <TileGradient />
    <InnerTile>{children}</InnerTile>
  </OuterTile>
);

const CompsByType = {
  COUNTDOWN: Countdown,
  MEDIA: Media,
  TWITTER_USER: TwitterUser,
  SHOW_NUMBER: ShowNumber,
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
          <Tile key={element.id} rect={position} color={element.color} totalRows={3} totalCols={4}>
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
      color
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
      showNumber {
        id
        label
        lastData
        data
      }
    }
  }
`;

export default TileManager;
