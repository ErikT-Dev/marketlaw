import React, { useEffect, useMemo } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { backgrounds } from '../../store/data';
import { increaseIncome, convertBonusToFunds, checkCombosForCompletion, updateCombosCount, updatePlayedBonusTypes } from '../../store';
import { PlayerStats } from '../../store/interfaces/playerStats';
import CardDisplay from '../GameWindowParts/CardDisplay/CardDisplay';
import StatsBoard from '../GameWindowParts/StatsBoard';
import PlayedCards from '../GameWindowParts/PlayedCards';
import IncompleteCombosBoard from '../GameWindowParts/IncompleteCombosBoard';
import CompleteCombosBoard from '../GameWindowParts/CompleteCombosBoard';
import TypesBoard from '../GameWindowParts/TypesBoard';
import CardsInHand from '../GameWindowParts/CardsInHand';
import ProjectsButton from '../GameWindowParts/Buttons/ProjectsButton';
import Tutorial from '../Tutorial/Tutorial';
import InfluenceButton from '../Influence/InfluenceButton';

const LeftSection = React.memo(() => (
    <View style={styles.leftSection}>
        <View style={styles.combosContainer}>
            <PlayedCards />
            <IncompleteCombosBoard />
            <CompleteCombosBoard />
        </View>
        <Tutorial />
    </View>
));

const CenterSection = React.memo(() => (
    <View style={styles.centerSection}>
        <View style={styles.buttonContainer}>
            <ProjectsButton />
            <InfluenceButton />
        </View>
        <View style={styles.cardDisplayContainer}>
            <CardDisplay />
        </View>
    </View>
));

const RightSection = React.memo(() => (
    <View style={styles.rightSection}>
        <CardsInHand />
        <TypesBoard />
        <StatsBoard />
    </View>
));

export default function GameWindow() {
    const dispatch = useDispatch();
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    useEffect(() => {
        dispatch(convertBonusToFunds());
    }, [dispatch, playerStats.bonus]);

    useEffect(() => {
        dispatch(increaseIncome());
    }, [dispatch, playerStats.workforce, playerStats.quality, playerStats.satisfaction, playerStats.product, playerStats.sales]);

    const backgroundImage = useMemo(() => backgrounds[1], []);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={backgroundImage}
                resizeMode="cover"
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
            >
                <View style={styles.content}>
                    <LeftSection />
                    <CenterSection />
                    <RightSection />
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#03071e',
    },
    backgroundImage: {
        flex: 1,
    },
    backgroundImageStyle: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    leftSection: {
        width: '30%',
    },
    combosContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    centerSection: {
        height: '100%',
        width: '30%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cardDisplayContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        height: '100%',
        flexDirection: 'row',
        width: '40%',
        justifyContent: 'flex-end',
    },
});