import React from "react";
import styled from "react-emotion";
import Countdown from "./tiles/Countdown";
import gql from "graphql-tag";
import Media from "./tiles/Media";

const getRelativeScores = inputPlacements => {
  const placements = inputPlacements.map((p, i) => ({
    p,
    modScore: p.currentScore < 0 ? -Math.log(-p.currentScore + 1) : p.currentScore,
  }));
  const min =
    placements.reduce((m, p) => (p.modScore < m ? p.modScore : m), Number.POSITIVE_INFINITY) - 1;
  placements.forEach(p => (p.modScore = p.modScore - min));
  const sum = placements.reduce((m, p) => m + p.modScore, 0);
  placements.forEach(p => (p.modScore = p.modScore / sum));
  return placements;
};

// assumes validSizes is sorted
const findValidTileSize = (desired, validSizes) =>
  desired === 0
    ? 0
    : validSizes.find((s, i) => {
        if (s >= desired) return true;
        if (i + 1 === validSizes.length) return true;
        if (validSizes[i + 1] < desired) return false;
        return desired - s > validSizes[i + 1] - desired ? false : true;
      });

const VALID_TILE_SIZES = [1, 2, 3, 4, 6, 8, 9, 12];
const VALID_DIMENSIONS = {
  12: [{w: 4, h: 3}],
  9: [{w: 3, h: 3}],
  8: [{w: 4, h: 2}],
  6: [{w: 3, h: 2}],
  4: [{w: 2, h: 2}],
  3: [{w: 3, h: 1}, {w: 1, h: 3}],
  2: [{w: 2, h: 1}, {w: 1, h: 2}],
  1: [{w: 1, h: 1}],
};
const limitTileSize = {8: [4], 6: [6, 4], 4: [6]};

const assignTileCounts = (
  list,
  remainingTiles,
  usedUpRelSpace,
  scoreGetter,
  tileSetter,
  validTileSizes
) => {
  const head = list[0];
  const tail = list.slice(1);
  if (tail.length === 0) {
    const tiles = findValidTileSize(
      remainingTiles,
      validTileSizes.filter(s => s <= remainingTiles)
    );
    tileSetter(head, tiles || 0);
  } else {
    const score = scoreGetter(head);
    const tiles = findValidTileSize(
      Math.ceil((remainingTiles * score) / (1 - usedUpRelSpace)),
      validTileSizes
    );
    const nextValidTileSize = limitTileSize[tiles]
      ? validTileSizes.filter(s => !limitTileSize[tiles].some(t => t === s))
      : validTileSizes;
    tileSetter(head, tiles);
    assignTileCounts(
      tail,
      remainingTiles - tiles,
      usedUpRelSpace + score,
      scoreGetter,
      tileSetter,
      nextValidTileSize
    );
  }
};

// sourceChunk: {x,y,w,h}, newBlock: {x,y,w,h}
// chunkA priotizes top over left
const splitChunkA = (sourceChunk, newBlock) => {
  const chunks = [];
  if (sourceChunk.y < newBlock.y) {
    //top
    chunks.push({
      x: sourceChunk.x,
      y: sourceChunk.y,
      w: sourceChunk.w,
      h: newBlock.y - sourceChunk.y,
    });
  }
  if (sourceChunk.x < newBlock.x) {
    // left
    chunks.push({x: sourceChunk.x, y: newBlock.y, w: newBlock.x - sourceChunk.x, h: newBlock.h});
  }
  if (newBlock.x + newBlock.w < sourceChunk.x + sourceChunk.w) {
    // right
    chunks.push({
      x: newBlock.x + newBlock.w,
      y: newBlock.y,
      w: sourceChunk.x + sourceChunk.w - (newBlock.x + newBlock.w),
      h: newBlock.h,
    });
  }
  if (newBlock.y + newBlock.h < sourceChunk.y + sourceChunk.h) {
    // bottom
    chunks.push({
      x: sourceChunk.x,
      y: newBlock.y + newBlock.h,
      w: sourceChunk.w,
      h: sourceChunk.y + sourceChunk.h - (newBlock.y + newBlock.h),
    });
  }
  return chunks;
};

// sourceChunk: {x,y,w,h}, newBlock: {x,y,w,h}
// chunkB priotizes left over top
const splitChunkB = (sourceChunk, newBlock) => {
  const chunks = [];
  if (sourceChunk.x < newBlock.x) {
    // left
    chunks.push({
      x: sourceChunk.x,
      y: sourceChunk.y,
      w: newBlock.x - sourceChunk.x,
      h: sourceChunk.h,
    });
  }

  if (sourceChunk.y < newBlock.y) {
    //top
    chunks.push({
      x: newBlock.x,
      y: sourceChunk.y,
      w: newBlock.w,
      h: newBlock.y - sourceChunk.y,
    });
  }

  if (newBlock.x + newBlock.w < sourceChunk.x + sourceChunk.w) {
    // right
    chunks.push({
      x: newBlock.x + newBlock.w,
      y: sourceChunk.y,
      w: sourceChunk.x + sourceChunk.w - (newBlock.x + newBlock.w),
      h: sourceChunk.h,
    });
  }
  if (newBlock.y + newBlock.h < sourceChunk.y + sourceChunk.h) {
    // bottom
    chunks.push({
      x: newBlock.x,
      y: newBlock.y + newBlock.h,
      w: newBlock.w,
      h: sourceChunk.y + sourceChunk.h - (newBlock.y + newBlock.h),
    });
  }
  return chunks;
};

// console.log("splitChunk", splitChunk({x: 0, y: 0, w: 4, h: 3}, {x: 2, y: 1, w: 1, h: 1}));

const findSuitableChunk = (chunks, tileCount) =>
  chunks.find(c =>
    VALID_DIMENSIONS[tileCount].some(desired => c.w >= desired.w && c.h >= desired.h)
  );

// assumes that list is sorted by greatest tile count to smallest
const assignChunks = (list, availableChunks, getTileCount, setCoords) => {
  const head = list[0];
  const tileCount = getTileCount(head);
  if (!tileCount) {
    setCoords(head, null);
    return;
  }
  const tail = list.slice(1);
  const nextTileCount = tail.length > 0 ? getTileCount(tail[0]) : null;
  const suitableChunk = findSuitableChunk(availableChunks, tileCount);
  if (!suitableChunk) {
    console.warn(
      `warning! couldn't fit tileSize ${tileCount} into ${JSON.stringify(availableChunks)}`
    );
    setCoords(head, null);
    if (tail.length > 0) assignChunks(tail, availableChunks, getTileCount, setCoords);
    return;
  }

  const remainingChunks = availableChunks.filter(c => c !== suitableChunk);
  const suitableDimensions = VALID_DIMENSIONS[tileCount].find(
    desired => suitableChunk.w >= desired.w && suitableChunk.h >= desired.h
  );
  let newBlock;
  if (suitableChunk.w >= suitableDimensions.w * 2 || suitableChunk.w >= suitableDimensions.w * 2) {
    // check if we can put the block into the middle of the suitable chunk without preventing the next
    // tile from being placed somewhere
    newBlock = {
      x: suitableChunk.x + Math.floor((suitableChunk.w - suitableDimensions.w) / 2),
      w: suitableDimensions.w,
      y: suitableChunk.y + Math.floor((suitableChunk.h - suitableDimensions.h) / 2),
      h: suitableDimensions.h,
    };
    if (
      nextTileCount &&
      !(
        findSuitableChunk(
          [...splitChunkA(suitableChunk, newBlock), ...remainingChunks],
          nextTileCount
        ) ||
        findSuitableChunk(
          [...splitChunkB(suitableChunk, newBlock), ...remainingChunks],
          nextTileCount
        )
      )
    ) {
      newBlock = null;
    }
  }
  if (!newBlock) {
    newBlock = {
      x: suitableChunk.x,
      w: suitableDimensions.w,
      y: suitableChunk.y,
      h: suitableDimensions.h,
    };
  }
  setCoords(head, newBlock);
  if (tail.length > 0) {
    const splitA = splitChunkA(suitableChunk, newBlock);
    const newChunksA = [...splitA, ...remainingChunks];

    // meh... I don't really wann set up a full-blown backtracking-engine
    const badCase =
      tileCount === 6 && nextTileCount === 3 && tail.length >= 2 && getTileCount(tail[1]) === 3;

    if (nextTileCount && !badCase && findSuitableChunk(newChunksA, nextTileCount)) {
      assignChunks(tail, newChunksA, getTileCount, setCoords);
    } else {
      assignChunks(
        tail,
        [...splitChunkB(suitableChunk, newBlock), ...remainingChunks],
        getTileCount,
        setCoords
      );
    }
  }
};

// assignTileCounts([0.5, 0.2, 0.2, 0.1], 12, 0, p => p, (p, t) => console.log(t), VALID_TILE_SIZES);

// 00 01 02 03
// 04 05 06 07
// 08 09 10 11

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
      fontSize: `${(rect.h * hUnit) / 2}px`,
      top: `${rect.y * hUnit}%`,
      left: `${rect.x * wUnit}%`,
      height: `${rect.h * hUnit}%`,
      width: `${rect.w * wUnit}%`,
    };
  }
);

const CompsByType = {
  COUNTDOWN: Countdown,
  MEDIA: Media,
};

const getComponent = p => {
  const Comp = CompsByType[p.type];
  return Comp ? <Comp data={p} /> : <div>Unknown Tile of type {p.type}</div>;
};

const TileManager = ({data}) => {
  if (!data.topPlacements.length) return "no tiles yet";
  const relPlacements = getRelativeScores(data.topPlacements);
  relPlacements.sort((a, b) => (a.modScore > b.modScore ? -1 : a.modScore < b.modScore ? 1 : 0));
  assignTileCounts(
    relPlacements,
    12,
    0,
    p => p.modScore,
    (p, t) => (p.tiles = t),
    VALID_TILE_SIZES
  );
  assignChunks(relPlacements, [{x: 0, y: 0, w: 4, h: 3}], p => p.tiles, (p, c) => (p.rect = c));
  return (
    <Container>
      {relPlacements.filter(r => r.rect).map((r, i) => (
        <Tile key={i} rect={r.rect} totalRows={3} totalCols={4}>
          {getComponent(r.p)}
        </Tile>
      ))}
    </Container>
  );
};
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
    }
  }
`;

export default TileManager;
