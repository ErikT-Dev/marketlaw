import React from 'react';
import { Image, Text, ImageSourcePropType } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { icons } from '../../store/data';
import { menuStyles } from '../../styleSheets/menu';
import { AllIconTypes } from '../../store/interfaces/gameTypes';

const { Popover } = renderers;

interface GameIconProps {
    stat: AllIconTypes;
    includePopup?: boolean;
}

interface IconProps {
    color: string;
    width: number;
    height: number;
}

const colors = {
    myGreen: '#6af533',
    myRed: '#ff513d',
    myYellow: '#fadf16',
    myBlue: '#00a2ff',
    myPurple: '#da6cff',
    myOrange: '#ffa12e',
    default: '#1d2033',
    tutorial: '#392a4a',
};

const iconPropsLookup: Record<AllIconTypes, IconProps> = {
    Beautification: { color: colors.myGreen, width: 17, height: 17 },
    Food: { color: colors.myGreen, width: 13.9, height: 17 },
    'Suburban Housing': { color: colors.myGreen, width: 17, height: 15.8 },
    Education: { color: colors.myBlue, width: 13.9, height: 17 },
    Service: { color: colors.myYellow, width: 17, height: 13.75 },
    'Mass Transit': { color: colors.myBlue, width: 16.7, height: 17 },
    Retail: { color: colors.myYellow, width: 17, height: 17 },
    'City Housing': { color: colors.myGreen, width: 17, height: 17 },
    'Raw Material': { color: colors.myRed, width: 17, height: 16.8 },
    Luxury: { color: colors.myPurple, width: 17, height: 13.35 },
    Utility: { color: colors.myBlue, width: 12.02, height: 18 },
    'Heavy Industry': { color: colors.myRed, width: 17, height: 15.87 },
    Farm: { color: colors.myRed, width: 18, height: 13.99 },
    Forestry: { color: colors.myGreen, width: 18, height: 16.1 },
    Grain: { color: colors.myOrange, width: 17, height: 17 },
    Leisure: { color: colors.myOrange, width: 17.5, height: 17.5 },
    'Rental Space': { color: colors.myYellow, width: 17, height: 16.8 },
    'Power Plant': { color: colors.myYellow, width: 13.7, height: 17 },
    Health: { color: colors.myRed, width: 17, height: 13.87 },
    'High Tech': { color: colors.myBlue, width: 17, height: 17 },
    Mine: { color: colors.myRed, width: 16.9, height: 17 },
    Safety: { color: colors.myBlue, width: 18, height: 13.99 },
    Sea: { color: colors.myBlue, width: 17, height: 15.6 },
    'Town Housing': { color: colors.myGreen, width: 17, height: 16 },
    'Mass Media': { color: colors.myPurple, width: 15.5, height: 17 },
    Alcohol: { color: colors.myPurple, width: 15.39, height: 18 },
    Mercantile: { color: colors.myOrange, width: 17, height: 14.55 },
    'Low Wealth': { color: colors.myOrange, width: 18, height: 15.55 },
    Office: { color: colors.myYellow, width: 14.2, height: 17 },
    'Light Industry': { color: colors.myOrange, width: 16.87, height: 17 },
    Finance: { color: colors.myYellow, width: 17, height: 13.94 },
    Petroleum: { color: colors.myRed, width: 13.88, height: 17 },
    Culture: { color: colors.myPurple, width: 15.33, height: 18 },
    tier: { color: colors.default, width: 16, height: 16 },
    cost: { color: '#e6293c', width: 10.027, height: 16 },
    funds: { color: '#e6293c', width: 10.027, height: 16 },
    workforce: { color: '#0c7001', width: 16, height: 15.539 },
    quality: { color: '#b82576', width: 15.47, height: 17 },
    satisfaction: { color: '#732ec9', width: 18, height: 17 },
    influenceQuality: { color: '#f7ecc8', width: 13.65, height: 15 },
    influenceSatisfaction: { color: '#f7ecc8', width: 17, height: 14.74 },
    product: { color: '#bf1802', width: 18, height: 13.359 },
    sales: { color: '#9e6f00', width: 16, height: 13.812 },
    income: { color: '#f7ecc8', width: 17, height: 17 },
    bonus: { color: '#f7ecc8', width: 17, height: 17 },
    influence: { color: '#4adbff', width: 19, height: 16.8 },
    'Turns played': { color: '#f7ecc8', width: 14.6, height: 17 },
    'Cards played': { color: 'white', width: 17, height: 17 },
    'Cards in hand': { color: '#f7ecc8', width: 13.4, height: 17 },
    Medal: { color: '#f7ecc8', width: 10.55, height: 18 },
    'Build pass': { color: '#858175', width: 19, height: 19 },
    'Has Build pass': { color: '#78ff93', width: 19, height: 19 },
    'Tutorial Income': { color: colors.tutorial, width: 17, height: 17 },
    'Tutorial Bonus': { color: colors.tutorial, width: 17, height: 17 },
    'Tutorial Turns played': { color: colors.tutorial, width: 14.6, height: 17 },
    'Tutorial Cards played': { color: colors.tutorial, width: 17, height: 17 },
};

export default function GameIcon({ stat, includePopup = true }: GameIconProps) {
    const getIconSource = (iconKey: string): ImageSourcePropType => {
        const icon = icons.find(i => i.key === iconKey);
        return icon ? icon.src : 0;
    };

    const renderIcon = () => {
        const props = iconPropsLookup[stat] || { color: colors.myGreen, width: 17, height: 17 };
        return (
            <Image
                source={getIconSource(stat)}
                tintColor={props.color}
                style={{ width: props.width, height: props.height }}
            />
        );
    };

    if (!includePopup) {
        return renderIcon();
    }

    return (
        <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
            <MenuTrigger>{renderIcon()}</MenuTrigger>
            <MenuOptions customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: menuStyles.popOverBody }}>
                <Text style={menuStyles.popOverText}>{stat}</Text>
            </MenuOptions>
        </Menu>
    );
}