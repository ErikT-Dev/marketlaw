import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';

import { drawViaInfluence } from '../../store';
import InfluenceCardToDraw from './InfluenceCardToDraw';
import GameIcon from '../Icons/GameIcon';
import { SectorTypes, TierTypes } from '../../store/interfaces/gameTypes';

type Tier = "T1" | "T2" | "T3";
type Sector = "Residential" | "Industrial" | "Service" | "Public";
type PublicCardType = "Quality" | "Satisfaction";

const cardOptions: Array<{
    tier: TierTypes;
    sector: SectorTypes;
    publicCardType?: PublicCardType;
}> = [
        { tier: 1, sector: "Residential" },
        { tier: 1, sector: "Industry" },
        { tier: 1, sector: "Service" },
        { tier: 1, sector: "Public", publicCardType: "Quality" },
        { tier: 1, sector: "Public", publicCardType: "Satisfaction" },
        { tier: 2, sector: "Residential" },
        { tier: 2, sector: "Industry" },
        { tier: 2, sector: "Service" },
        { tier: 2, sector: "Public", publicCardType: "Quality" },
        { tier: 2, sector: "Public", publicCardType: "Satisfaction" },
        { tier: 3, sector: "Residential" },
        { tier: 3, sector: "Industry" },
        { tier: 3, sector: "Service" },
        { tier: 3, sector: "Public", publicCardType: "Quality" },
        { tier: 3, sector: "Public", publicCardType: "Satisfaction" },
    ];

export default function Page4() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const dispatch = useDispatch();

    const handleDrawViaInfluence = (tier: TierTypes, sector: SectorTypes, publicCardType?: PublicCardType) => {
        dispatch(drawViaInfluence({ tier, sector, publicCardType }));
    };

    return (
        <View>
            <MenuOption disabled={true}>
                <View style={[repeatingElementsStyles.influenceOption, {
                    backgroundColor: playerStats.influence > 2 ? '#1d1f57' : '#28283d'
                }]}>
                    <Text style={{ fontSize: 14, color: '#d5edf2', fontWeight: "500" }}>For 2 + the card's tier of </Text>
                    <GameIcon includePopup={false} stat={'influence'} />
                    <Text style={{ fontSize: 14, color: '#d5edf2', fontWeight: "500" }}>: Draw a card of sector and tier of your choice:</Text>
                </View>
            </MenuOption>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {cardOptions.map(({ tier, sector, publicCardType }) => (
                    <MenuOption
                        key={`${tier}-${sector}-${publicCardType || ''}`}
                        onSelect={() => handleDrawViaInfluence(tier, sector, publicCardType)}
                    >
                        <InfluenceCardToDraw tier={tier} sector={sector} publicCardType={publicCardType} />
                    </MenuOption>
                ))}
            </View>
        </View>
    );
}