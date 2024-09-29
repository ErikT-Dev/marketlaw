import React, { useState } from 'react';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import StatText from '../StylingElements/StatText';
import Page2 from './Page2';
import Page1 from './Page1';
import Page3 from './Page3';
import Page5 from './Page5';
import Page4 from './Page4';
import Page6 from './Page6';
import InfluencePageSelector from './InfluencePageSelector';
import GameIcon from '../Icons/GameIcon';

type PageName = 'Page1' | 'Page2' | 'Page3' | 'Page4' | 'Page5' | 'Page6';

const pages: Record<PageName, React.ComponentType> = {
    Page1: Page1,
    Page2: Page2,
    Page3: Page3,
    Page4: Page4,
    Page5: Page5,
    Page6: Page6,
};

const MenuTriggerButton: React.FC<{ influence: number }> = ({ influence }) => (
    <View style={styles.triggerButton}>
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.triggerButtonText}>
            INFLUENCE
        </Text>
        <View style={styles.iconContainer}>
            <GameIcon includePopup={false} stat={'influence'} />
            <StatText stat={'influence'} text={` ${influence}`} />
        </View>
    </View>
);

const PageContent: React.FC<{ selectedPage: PageName }> = ({ selectedPage }) => {
    const PageComponent = pages[selectedPage];
    return <PageComponent />;
};

const PageSelectors: React.FC<{
    selectedPage: PageName;
    setSelectedPage: (page: PageName) => void;
}> = ({ selectedPage, setSelectedPage }) => (
    <View style={styles.pageSelectorsContainer}>
        {Object.keys(pages).map((page, index) => (
            <InfluencePageSelector
                key={page}
                pageText={romanNumerals[index]}
                isSelected={selectedPage === page}
                onSelect={() => setSelectedPage(page as PageName)}
            />
        ))}
    </View>
);

const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function InfluenceButton() {
    const [selectedPage, setSelectedPage] = useState<PageName>('Page1');
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    return (
        <Menu renderer={renderers.SlideInMenu}>
            <MenuTrigger>
                <MenuTriggerButton influence={playerStats.influence} />
            </MenuTrigger>
            <MenuOptions customStyles={menuCustomStyles}>
                <View style={styles.menuContent}>
                    <PageContent selectedPage={selectedPage} />
                    <PageSelectors selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
                </View>
            </MenuOptions>
        </Menu>
    );
}

const styles = StyleSheet.create({
    triggerButton: {
        backgroundColor: '#4449a4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginTop: 0,
        marginRight: 5,
        height: 38,
        flexDirection: 'row',
    } as ViewStyle,
    triggerButtonText: {
        fontSize: 13,
        color: 'white',
        fontWeight: '600',
    } as TextStyle,
    iconContainer: {
        flexDirection: 'row',
    } as ViewStyle,
    menuContent: {
        height: '100%',
        justifyContent: 'space-between',
    } as ViewStyle,
    pageSelectorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    } as ViewStyle,
});

const menuCustomStyles = {
    optionWrapper: {
        padding: 1,
        marginVertical: 4,
    },
    optionsContainer: {
        padding: 10,
        width: 500,
        height: 230,
        backgroundColor: 'rgba(74, 78, 135, 0.9)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'black',
    },
};