export const types = [
    'Beautification',
    'Leisure',
    'Sea',
    'Service',
    'Retail',
    'Mercantile',
    'Rental Space',
    'Raw Material',
    'Forestry',
    'Farm',
    'Power Plant',
    'Mine',
    'Food',
    'Alcohol',
    'Grain',
    'Utility',
    'Safety',
    'Health',
    'Education',
    'Mass Transit',
    'Mass Media',
    'Suburban Housing',
    'Low Wealth',
    'Town Housing',
    'Heavy Industry',
    'Office',
    'Luxury',
    'High Tech',
    'City Housing',
    'Light Industry',
    'Finance',
    'Petroleum',
    'Culture'
] as const;

export type TypeValues = typeof types[number];

export function isValidTypeValue(value: string): value is TypeValues {
    return types.includes(value as TypeValues);
}

export type StatsTypes = "workforce" | "quality" | "satisfaction" | 'cost' | 'product' | 'sales' | 'influence' | 'income' | 'bonus' | 'funds'

export type HighScoreStatsTypes = "workforce" | "quality" | "satisfaction" | 'product' | 'sales' | 'income' | 'funds'

export function isValidGainType(value: string): value is StatsTypes {
    return ['workforce', 'quality', 'satisfaction'].includes(value);
}

export type VarietyTypes =
    | 'tier'
    | 'influenceQuality'
    | 'influenceSatisfaction'
    | 'Turns played'
    | 'Cards played'
    | 'Cards in hand'
    | 'Medal'
    | 'Build pass'
    | 'Has Build pass'
    | 'Tutorial Income'
    | 'Tutorial Bonus'
    | 'Tutorial Turns played'
    | 'Tutorial Cards played';

export type AllIconTypes = TypeValues | StatsTypes | VarietyTypes;

export type SectorTypes = "Residential" | "Industry" | "Service" | "Public"

export type TierTypes = 1 | 2 | 3

export type CardSectorAndTier = 'Residential1' | 'Residential2' | 'Residential3' | 'Public1' | 'Public2' | 'Public3' | 'Industry1' | 'Industry2' | 'Industry3' | 'Service1' | 'Service2' | 'Service3';

export interface Type {
    type: TypeValues;
    count: number;
}

