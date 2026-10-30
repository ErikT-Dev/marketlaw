import type { QuestNameOfTier } from "./QuestNameOfTier";
import type { QuestTerms } from "./QuestTerms";

export const QUEST_TERMS_TIER_2: Readonly<Record<QuestNameOfTier<2>, QuestTerms>> = {
  "Growing suburbs": {
    needs: [
      { kind: "type", type: "Town Housing", count: 2 },
      { kind: "type", type: "Low Wealth", count: 1 },
    ],
    reward: { stats: { quality: 2 }, gainedType: null, draws: 0 },
  },
  "Upmarket homes": {
    needs: [
      { kind: "cards", sector: "Residential", lowestTier: 2, count: 2 },
      { kind: "type", type: "Luxury", count: 1 },
    ],
    reward: { stats: { satisfaction: 2 }, gainedType: null, draws: 0 },
  },
  "Modern industry": {
    needs: [
      { kind: "cards", sector: "Industry", lowestTier: 2, count: 2 },
      { kind: "type", type: "Light Industry", count: 1 },
    ],
    reward: { stats: { workforce: 2 }, gainedType: null, draws: 0 },
  },
  "Service economy": {
    needs: [
      { kind: "cards", sector: "Service", lowestTier: 2, count: 2 },
      { kind: "type", type: "Service", count: 1 },
    ],
    reward: { stats: { satisfaction: 2 }, gainedType: null, draws: 0 },
  },
  "Culture hub": {
    needs: [
      { kind: "cards", sector: "Public", lowestTier: 2, count: 3 },
      { kind: "type", type: "Culture", count: 1 },
    ],
    reward: { stats: { influence: 3 }, gainedType: "Culture", draws: 0 },
  },
  "Factory town": {
    needs: [
      { kind: "type", type: "Town Housing", count: 2 },
      { kind: "type", type: "Light Industry", count: 1 },
    ],
    reward: { stats: { quality: 1 }, gainedType: "Light Industry", draws: 0 },
  },
  "Market town": {
    needs: [
      { kind: "type", type: "Town Housing", count: 1 },
      { kind: "type", type: "Retail", count: 1 },
      { kind: "type", type: "Food", count: 1 },
    ],
    reward: { stats: {}, gainedType: "Retail", draws: 1 },
  },
  "Industrial zone": {
    needs: [
      { kind: "type", type: "Light Industry", count: 2 },
      { kind: "type", type: "Raw Material", count: 1 },
    ],
    reward: { stats: { funds: 4 }, gainedType: null, draws: 0 },
  },
  "Shopping centre": {
    needs: [
      { kind: "type", type: "Retail", count: 2 },
      { kind: "type", type: "Service", count: 1 },
      { kind: "type", type: "Leisure", count: 1 },
    ],
    reward: { stats: { satisfaction: 2 }, gainedType: null, draws: 0 },
  },
  "Leisure park": {
    needs: [
      { kind: "type", type: "Leisure", count: 2 },
      { kind: "type", type: "Beautification", count: 1 },
    ],
    reward: { stats: { funds: 2 }, gainedType: "Beautification", draws: 0 },
  },
  "Culture district": {
    needs: [
      { kind: "type", type: "Culture", count: 2 },
      { kind: "type", type: "Education", count: 1 },
    ],
    reward: { stats: { satisfaction: 1 }, gainedType: "Culture", draws: 0 },
  },
  "Safe streets": {
    needs: [
      { kind: "stat", stat: "quality", count: 6 },
      { kind: "type", type: "Safety", count: 1 },
    ],
    reward: { stats: { workforce: 2 }, gainedType: null, draws: 0 },
  },
  "Happy residents": {
    needs: [
      { kind: "stat", stat: "satisfaction", count: 6 },
      { kind: "type", type: "Leisure", count: 1 },
    ],
    reward: { stats: { workforce: 1, quality: 1 }, gainedType: null, draws: 0 },
  },
  "Civic pride": {
    needs: [
      { kind: "projects", count: 1 },
      { kind: "type", type: "Beautification", count: 2 },
    ],
    reward: { stats: { funds: 2, influence: 3 }, gainedType: null, draws: 0 },
  },
  "Service boom": {
    needs: [
      { kind: "income", count: 7 },
      { kind: "type", type: "Service", count: 1 },
    ],
    reward: { stats: {}, gainedType: null, draws: 2 },
  },
};
