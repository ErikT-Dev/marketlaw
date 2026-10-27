import * as v from "valibot";
import { TypeName } from "./TypeName";

const TYPES_BY_POINTS = [
  {
    points: 2,
    types: [
      "Suburban Housing",
      "Low Wealth",
      "Town Housing",
      "Luxury",
      "City Housing",
      "Light Industry",
      "Heavy Industry",
      "High Tech",
      "Service",
      "Leisure",
      "Retail",
      "Culture",
      "Office",
    ],
  },
  {
    points: 3,
    types: [
      "Raw Material",
      "Forestry",
      "Farm",
      "Power Plant",
      "Mine",
      "Food",
      "Sea",
      "Utility",
      "Mass Transit",
      "Health",
      "Mercantile",
      "Beautification",
      "Safety",
      "Education",
    ],
  },
  {
    points: 4,
    types: ["Alcohol", "Grain", "Petroleum", "Mass Media", "Finance", "Rental Space"],
  },
] as const;

export const TYPE_POINTS: ReadonlyMap<TypeName, 2 | 3 | 4> = new Map(
  TYPES_BY_POINTS.flatMap(({ points, types }) =>
    types.map((type) => [v.parse(TypeName, type), points] as const),
  ),
);
