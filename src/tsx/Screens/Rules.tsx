import React from 'react';
import { Text, View, Pressable, ScrollView, ImageBackground, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { backgrounds } from '../../store/data';
import { setTutorialData } from '../../store';
import { RootStackNavigatorParamsList } from '../../../App';
import { gameMenuStyles } from '../../styleSheets/gameMenu';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import GameIcon from '../Icons/GameIcon';
import { TutorialData } from '../../store/interfaces/tutorialData';
import { StatsTypes, TypeValues, VarietyTypes } from '../../store/interfaces/gameTypes';

interface IconTextPairProps {
    iconStat: StatsTypes | TypeValues | VarietyTypes;
    text: string;
}

const IconTextPair: React.FC<IconTextPairProps> = ({ iconStat, text }) => (
    <View style={repeatingElementsStyles.rulesElement}>
        <GameIcon includePopup={false} stat={iconStat} />
        <Text style={styles.glossaryText}> - {text}</Text>
    </View>
);

const Glossary: React.FC = () => (
    <View style={styles.glossaryContainer}>
        <IconTextPair iconStat="cost" text="funds" />
        <IconTextPair iconStat="tier" text="card tier" />
        <IconTextPair iconStat="workforce" text="workforce" />
        <IconTextPair iconStat="quality" text="quality" />
        <IconTextPair iconStat="satisfaction" text="satisfaction" />
        <IconTextPair iconStat="product" text="product" />
        <IconTextPair iconStat="sales" text="sales" />
        <IconTextPair iconStat="income" text="income" />
        <IconTextPair iconStat="bonus" text="bonus" />
        <IconTextPair iconStat="Turns played" text="number of turns played" />
        <IconTextPair iconStat="Cards played" text="number of cards played" />
    </View>
);

const TypesList: React.FC = () => {
    const typeValues: TypeValues[] = [
        "Beautification", "Leisure", "Sea", "Service", "Retail", "Mercantile", "Rental Space",
        "Raw Material", "Forestry", "Farm", "Power Plant", "Mine", "Food", "Alcohol", "Grain",
        "Utility", "Safety", "Health", "Education", "Mass Transit", "Mass Media", "Suburban Housing",
        "Low Wealth", "Town Housing", "Heavy Industry", "Light Industry", "Office", "Finance",
        "Luxury", "High Tech", "City Housing", "Petroleum", "Culture"
    ];

    return (
        <View style={styles.glossaryContainer}>
            {typeValues.map(type => (
                <IconTextPair key={type} iconStat={type} text={type} />
            ))}
        </View>
    );
};

interface RuleSectionProps {
    text: string;
}

const RuleSection: React.FC<RuleSectionProps> = ({ text }) => (
    <Text style={styles.ruleText}>{text}</Text>
);

const Rules: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamsList>>();
    const dispatch = useDispatch();
    const tutorialData = useSelector((state: { tutorialData: TutorialData }) => state.tutorialData);

    return (
        <View style={gameMenuStyles.menuBackground}>
            <ImageBackground source={backgrounds[1]} resizeMode="cover" style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
                <View style={gameMenuStyles.menuScreen}>
                    <View style={styles.contentContainer}>
                        <ScrollView>
                            <Glossary />
                            <RuleSection text="•	In order to play a card from your hand you need to pay the amount of funds specified on the card. After playing a card your rightmost statsboard is updated based on the values on the card. Cards also have a tier, sector, types and demands. The sectors are Residential (green), Public (blue), Industry (red) and Service (yellow). Every time you play a card all future cards of the same tier and sector will cost 1 more to play. You may play only 1 card per turn (unless you buy build pass)." />
                            <RuleSection text="•	To win the game you must acquire 22 income and complete 3 projects. You start the game with 3 base income. At the beginning of each turn you gain funds based on your income. To gain an income you must have at least 1 leftover product and sales in your statsboard and your workforce, quality and satisfaction all must be 0 or higher. Whenever you gain an income it consumes 1 of product and sales and you draw a random card. To complete any project you must pay its cost and all of your stats must be 0 or higher. The reward for completing any of the projects is that you gain 1 income, draw a random card and gain 2 funds. When completing all 3 projects you gain an extra income, draw a  random card and gain 2 funds. The goal of the game is to end the game with as few turns as possible." />
                            <RuleSection text="•	When you play a card you gain all the types and demands listed on that card. Whenever you meet the requirements of any of the demands you have gained, you may claim its reward. There are 2 types of demands: regular and continuous (marked by a blue background). Regular demands give you a reward only once upon completion. With continuous demands however, you can claim the reward again each time you meet the requirements. Among all the cards there are the following types:" />
                            <TypesList />
                            <RuleSection text="•	In addition to the income there are 3 more ways to gain funds. You can sell cards from your hand by pressing the 'Hand' button to toggle selling. You can complete projects to gain funds and income. Additionally you gain bonus at the end of each turn based on your leftover workforce, quality, satisfaction, product and sales. For every workforce, quality and satisfaction you gain (or lose) 1 of bonus, based on whether the value is negative or positive. For each product you gain 4 of bonus and for each sale 3. At any point when your bonus reaches 10 you gain 1 of funds and lose 10 of bonus." />
                            <RuleSection text="•	 When you finish a game your ending score is calculated based on your ending stats using the following formula: you gain 25 points for every turn you finish earlier, 6,5 points for every income, 0,2 points for every lefover funds or card in your hand. Rest of your stats will count as: 1 workforce = 0,7 points, 1 quality = 0,55 points, 1 satisfaction = 0,5 points, 1 product = 2,75 points and 1 sales = 2,25 points. Your finished games can be viewed from the 'High scores' page." />
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={({ pressed }) => [gameMenuStyles.menuButton, { backgroundColor: pressed ? '#ffbb4f' : '#ffcd7d' }]}
                                onPress={() => navigation.navigate('MainMenu')}
                            >
                                <Text style={styles.buttonText}>Back</Text>
                            </Pressable>
                            {!tutorialData.tutorialOn && (
                                <Pressable
                                    style={({ pressed }) => [gameMenuStyles.menuButton, { backgroundColor: pressed ? '#ffbb4f' : '#ffcd7d' }]}
                                    onPress={() => dispatch(setTutorialData({ tutorialOn: true, tutorialStep: 1 }))}
                                >
                                    <Text style={styles.buttonText}>Reset tutorial</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        flexDirection: 'row',
    },
    backgroundImageStyle: {
        opacity: 0.6,
    },
    contentContainer: {
        width: '80%',
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 10,
        margin: 15,
        padding: 15,
        alignItems: 'center',
    },
    glossaryContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        backgroundColor: '#5e2d32',
        padding: 5,
        borderRadius: 3,
    },
    glossaryText: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 17,
        color: '#fcd8cf',
        fontWeight: "400",
    },
    ruleText: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 17,
        color: '#6b5148',
        fontWeight: "400",
    },
    sectionTitle: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 20,
        color: '#6b5148',
        fontWeight: "600",
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    buttonText: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 20,
        color: '#a69692',
        fontWeight: "500",
    },
});

export default Rules;