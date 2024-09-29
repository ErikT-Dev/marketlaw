import React from 'react';
import { Text } from 'react-native';
import { turnToRomanNumerals } from '../../store/functions/turnToRomanNumerals';

import { LinearGradient } from 'expo-linear-gradient';
import GameIcon from '../Icons/GameIcon';
import { SectorTypes, TierTypes } from '../../store/interfaces/gameTypes';

interface InfluenceCardToDrawProps {
    tier: TierTypes;
    sector: SectorTypes
    publicCardType?: "Quality" | "Satisfaction";
}

export default function InfluenceCardToDraw({ tier, sector, publicCardType }: InfluenceCardToDrawProps) {
    const cardTier = tier;
    const isPQ = sector === "Public" && publicCardType === "Quality";
    const isPS = sector === "Public" && publicCardType === "Satisfaction";
    const textToDisplay = turnToRomanNumerals(cardTier);

    const getGradientColors = () => {
        switch (sector) {
            case 'Residential': return ['#154716', '#154733'];
            case 'Industry': return ['#673c25', '#5c2121'];
            case 'Service': return ['#977a10', '#835e10'];
            case 'Public': return ['#114895', '#1e3189'];
        }
    };

    return (
        <LinearGradient
            colors={getGradientColors()}
            start={{ x: 1, y: 0.1 }}
            style={{
                borderColor: 'black',
                borderWidth: 0.9,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 5,
                borderRadius: 0,
                height: 30,
                width: 80,
                flexDirection: 'row',
                shadowColor: 'black',
                shadowOpacity: 0.8,
                elevation: 40,
                shadowRadius: 30,
                shadowOffset: { width: 56, height: 13 },
            }}>
            <Text
                adjustsFontSizeToFit={true}
                style={{
                    fontFamily: 'serif',
                    color: '#f7ecc8',
                    fontSize: 12,
                    fontWeight: '400'
                }}
            >
                {textToDisplay}{(isPQ || isPS) && '  '}
            </Text>
            {isPQ && <GameIcon includePopup={false} stat={'influenceQuality'} />}
            {isPS && <GameIcon includePopup={false} stat={'influenceSatisfaction'} />}
        </LinearGradient>
    );
}