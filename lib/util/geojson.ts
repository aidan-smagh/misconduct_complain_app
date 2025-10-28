import { Geometry, Position } from "geojson";
import polylabel from "polylabel";
import * as turf from "@turf/turf";

export function getInteriorPoint(geometry: Geometry): Position | null {
  switch (geometry.type) {
    case "Point":
      return geometry.coordinates;

    case "LineString":
      return getMidpointAlongLine(geometry.coordinates);

    case "MultiLineString":
      return getLongestLineMidpoint(geometry.coordinates);

    case "Polygon":
      return polylabel(geometry.coordinates as Position[][], 0.000001);

    case "MultiPolygon":
      return getLargestPolygonPole(geometry.coordinates);

    default:
      return null;
  }
}

function getMidpointAlongLine(line: Position[]): Position {
  const lineString = turf.lineString(line);
  const totalLength = turf.length(lineString);
  const midpoint = turf.along(lineString, totalLength / 2);

  return midpoint.geometry.coordinates as Position;
}

function getLongestLineMidpoint(lines: Position[][]): Position | null {
  if (!lines.length) {
    return null;
  }

  // Find the longest line
  let longestLine: Position[];
  let maxLength = 0;

  for (const line of lines) {
    const length = getLineLength(line);

    if (length > maxLength) {
      maxLength = length;
      longestLine = line;
    }
  }

  // Calculate the midpoint
  return getMidpointAlongLine(longestLine);
}

function getLargestPolygonPole(polygons: Position[][][]): Position | null {
  if (!polygons.length) {
    return null;
  }

  // Find the largest polygon
  let largestPolygon = polygons[0];
  let maxArea = getPolygonArea(polygons[0])

  for (let i = 1; i < polygons.length; i++) {
    const area = getPolygonArea(polygons[i]);

    if (area > maxArea) {
      maxArea = area;
      largestPolygon = polygons[i];
    }
  }

  // Calculate the pole of inaccessibility
  return polylabel(largestPolygon as Position[][], 0.000001);
}

function getPolygonArea(polygon: Position[][]): number {
  if (!polygon.length) {
    return 0;
  }

  // Area of outer ring
  let area = turf.area(turf.polygon([polygon[0]]));

  // Subtract areas of holes
  for (let i = 1; i < polygon.length; i++) {
    area -= turf.area(turf.polygon([polygon[i]]));
  }

  return area;
}

function getLineLength(line: Position[]): number {
  return turf.length(turf.lineString(line));
}
