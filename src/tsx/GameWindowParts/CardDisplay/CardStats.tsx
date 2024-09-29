import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameIcon from '../../Icons/GameIcon';
import StatText from '../../StylingElements/StatText';
import { TypeValues } from '../../../store/interfaces/gameTypes';

interface StatItemProps {
    stat: TypeValues;
    value: number | string;
}

const StatItem: React.FC<StatItemProps> = ({ stat, value }) => (
    <View style={styles.stat}>
        <GameIcon includePopup={false} stat={stat} />
        <StatText stat={stat} text={`${value}`} />
    </View>
);

interface CardStatsProps {
    card: {
        tier: number;
        cost: number;
        workforce: number;
        quality: number;
        satisfaction: number;
        sales: number;
        product: number;
    };
    calcTierTax: () => number;
    addWorkforceMinus: string;
    addPublicMinus: string;
}

const CardStats: React.FC<CardStatsProps> = ({ card, calcTierTax, addWorkforceMinus, addPublicMinus }) => {
    const stats = [
        { stat: 'tier' as TypeValues, value: card.tier },
        { stat: 'cost' as TypeValues, value: card.cost + calcTierTax() },
        { stat: 'workforce' as TypeValues, value: `${addWorkforceMinus}${card.workforce}`, condition: card.workforce > 0 },
        { stat: 'quality' as TypeValues, value: `${addPublicMinus}${card.quality}`, condition: card.quality > 0 },
        { stat: 'satisfaction' as TypeValues, value: `${addPublicMinus}${card.satisfaction}`, condition: card.satisfaction > 0 },
        { stat: 'sales' as TypeValues, value: card.sales, condition: card.sales > 0 },
        { stat: 'product' as TypeValues, value: card.product, condition: card.product > 0 },
    ];

    return (
        <View style={styles.cardStats}>
            {stats.map((item, index) =>
                (item.condition === undefined || item.condition) && (
                    <StatItem key={index} stat={item.stat} value={item.value} />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardStats: {
        flex: 0.12,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
    },
    stat: {
        marginVertical: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default CardStats;