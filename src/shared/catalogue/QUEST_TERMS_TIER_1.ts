import type { QuestNameOfTier } from "./QuestNameOfTier";
import type { QuestTerms } from "./QuestTerms";

export const QUEST_TERMS_TIER_1: Readonly<Record<QuestNameOfTier<1>, QuestTerms>> = {
  "Working district": {
    needs: [
      { kind: "cards", sector: "Residential", lowestTier: 1, count: 3 },
      { kind: "type", type: "Low Wealth", count: 1 },
    ],
    reward: { stats: { quality: 1 }, gainedType: null, draws: 0 },
  },
  "Farming industry": {
    needs: [
      { kind: "cards", sector: "Industry", lowestTier: 1, count: 2 },
      { kind: "type", type: "Farm", count: 1 },
    ],
    reward: { stats: { workforce: 1 }, gainedType: null, draws: 0 },
  },
  "Local services": {
    needs: [
      { kind: "cards", sector: "Service", lowestTier: 1, count: 2 },
      { kind: "type", type: "Service", count: 1 },
    ],
    reward: { stats: { satisfaction: 1 }, gainedType: null, draws: 0 },
  },
  "Green city": {
    needs: [
      { kind: "cards", sector: "Public", lowestTier: 1, count: 3 },
      { kind: "type", type: "Beautification", count: 2 },
    ],
    reward: { stats: { funds: 3 }, gainedType: null, draws: 0 },
  },
  Countryside: {
    needs: [
      { kind: "type", type: "Suburban Housing", count: 1 },
      { kind: "type", type: "Farm", count: 1 },
    ],
    reward: { stats: {}, gainedType: "Suburban Housing", draws: 0 },
  },
  Farmland: {
    needs: [
      { kind: "type", type: "Farm", count: 1 },
      { kind: "type", type: "Food", count: 2 },
    ],
    reward: { stats: {}, gainedType: "Farm", draws: 0 },
  },
  "Fishing village": {
    needs: [
      { kind: "type", type: "Sea", count: 1 },
      { kind: "type", type: "Food", count: 2 },
    ],
    reward: { stats: { funds: 1 }, gainedType: "Sea", draws: 0 },
  },
  "Sports town": {
    needs: [
      { kind: "type", type: "Leisure", count: 1 },
      { kind: "type", type: "Health", count: 1 },
    ],
    reward: { stats: {}, gainedType: "Health", draws: 0 },
  },
  "High street": {
    needs: [
      { kind: "type", type: "Retail", count: 2 },
      { kind: "type", type: "Suburban Housing", count: 1 },
    ],
    reward: { stats: { satisfaction: 1, funds: 1 }, gainedType: null, draws: 0 },
  },
  "Mining town": {
    needs: [
      { kind: "type", type: "Mine", count: 1 },
      { kind: "type", type: "Low Wealth", count: 1 },
    ],
    reward: { stats: {}, gainedType: "Mine", draws: 0 },
  },
  "Workers' housing": {
    needs: [
      { kind: "stat", stat: "workforce", count: 5 },
      { kind: "type", type: "Low Wealth", count: 1 },
    ],
    reward: { stats: { funds: 1, influence: 3 }, gainedType: null, draws: 0 },
  },
  "Tidy streets": {
    needs: [
      { kind: "stat", stat: "quality", count: 5 },
      { kind: "type", type: "Beautification", count: 1 },
    ],
    reward: { stats: { workforce: 1 }, gainedType: null, draws: 0 },
  },
  "Healthy town": {
    needs: [
      { kind: "stat", stat: "satisfaction", count: 4 },
      { kind: "type", type: "Health", count: 1 },
    ],
    reward: { stats: { workforce: 1 }, gainedType: null, draws: 0 },
  },
  "Trading post": {
    needs: [
      { kind: "income", count: 4 },
      { kind: "type", type: "Retail", count: 1 },
    ],
    reward: { stats: { funds: 1, influence: 2 }, gainedType: null, draws: 0 },
  },
  "Supply chain": {
    needs: [
      { kind: "income", count: 5 },
      { kind: "type", type: "Raw Material", count: 1 },
    ],
    reward: { stats: {}, gainedType: null, draws: 1 },
  },
};
