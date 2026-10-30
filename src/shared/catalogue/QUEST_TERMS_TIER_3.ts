import type { QuestNameOfTier } from "./QuestNameOfTier";
import type { QuestTerms } from "./QuestTerms";

export const QUEST_TERMS_TIER_3: Readonly<Record<QuestNameOfTier<3>, QuestTerms>> = {
  Penthouses: {
    needs: [
      { kind: "cards", sector: "Residential", lowestTier: 2, count: 3 },
      { kind: "cards", sector: "Residential", lowestTier: 3, count: 1 },
      { kind: "type", type: "City Housing", count: 1 },
    ],
    reward: { stats: { quality: 3 }, gainedType: null, draws: 0 },
  },
  "Heavy industry": {
    needs: [
      { kind: "cards", sector: "Industry", lowestTier: 2, count: 3 },
      { kind: "type", type: "Heavy Industry", count: 1 },
    ],
    reward: { stats: { workforce: 3 }, gainedType: null, draws: 0 },
  },
  "Office district": {
    needs: [
      { kind: "cards", sector: "Service", lowestTier: 2, count: 3 },
      { kind: "type", type: "Office", count: 1 },
    ],
    reward: { stats: { satisfaction: 3 }, gainedType: null, draws: 0 },
  },
  "Public institutions": {
    needs: [
      { kind: "cards", sector: "Public", lowestTier: 2, count: 4 },
      { kind: "type", type: "Safety", count: 1 },
      { kind: "type", type: "Education", count: 1 },
    ],
    reward: { stats: { quality: 2, influence: 3 }, gainedType: null, draws: 0 },
  },
  "City living": {
    needs: [
      { kind: "type", type: "City Housing", count: 2 },
      { kind: "type", type: "Luxury", count: 1 },
    ],
    reward: { stats: { quality: 2 }, gainedType: "City Housing", draws: 0 },
  },
  "Tech campus": {
    needs: [
      { kind: "type", type: "High Tech", count: 2 },
      { kind: "type", type: "Education", count: 1 },
    ],
    reward: { stats: {}, gainedType: "High Tech", draws: 1 },
  },
  "Commuter city": {
    needs: [
      { kind: "type", type: "City Housing", count: 1 },
      { kind: "type", type: "Mass Transit", count: 1 },
    ],
    reward: { stats: { quality: 1 }, gainedType: "Mass Transit", draws: 0 },
  },
  "Business district": {
    needs: [
      { kind: "type", type: "Office", count: 2 },
      { kind: "type", type: "Finance", count: 1 },
    ],
    reward: { stats: { funds: 4, influence: 4 }, gainedType: null, draws: 0 },
  },
  "Media city": {
    needs: [
      { kind: "type", type: "Mass Media", count: 1 },
      { kind: "type", type: "Office", count: 1 },
      { kind: "type", type: "Culture", count: 1 },
    ],
    reward: { stats: { satisfaction: 2 }, gainedType: "Mass Media", draws: 0 },
  },
  "Tech industry": {
    needs: [
      { kind: "type", type: "High Tech", count: 1 },
      { kind: "type", type: "Heavy Industry", count: 1 },
    ],
    reward: { stats: {}, gainedType: null, draws: 2 },
  },
  Metropolis: {
    needs: [{ kind: "sectors_with_tier", tier: 3, count: 3 }],
    reward: { stats: {}, gainedType: null, draws: 3 },
  },
  "Balanced city": {
    needs: [
      { kind: "cards", sector: "Residential", lowestTier: 1, count: 3 },
      { kind: "cards", sector: "Industry", lowestTier: 1, count: 3 },
      { kind: "cards", sector: "Service", lowestTier: 1, count: 3 },
      { kind: "cards", sector: "Public", lowestTier: 1, count: 3 },
      { kind: "type", type: "Mass Transit", count: 1 },
    ],
    reward: { stats: { funds: 4 }, gainedType: null, draws: 2 },
  },
  "Cultural capital": {
    needs: [
      { kind: "stat", stat: "satisfaction", count: 8 },
      { kind: "type", type: "Culture", count: 1 },
    ],
    reward: { stats: { workforce: 3 }, gainedType: null, draws: 0 },
  },
  "Civic leader": {
    needs: [
      { kind: "projects", count: 2 },
      { kind: "type", type: "Safety", count: 1 },
    ],
    reward: { stats: { quality: 2, satisfaction: 2 }, gainedType: null, draws: 0 },
  },
  "High-tech economy": {
    needs: [
      { kind: "income", count: 10 },
      { kind: "type", type: "High Tech", count: 1 },
    ],
    reward: { stats: {}, gainedType: null, draws: 3 },
  },
};
