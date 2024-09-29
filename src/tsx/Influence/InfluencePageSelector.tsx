import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';

interface InfluencePageSelectorProps {
    pageText: string;
    onSelect: () => void;
    isSelected: boolean;
}

const InfluencePageSelector: React.FC<InfluencePageSelectorProps> = ({ pageText, onSelect, isSelected }) => {
    return (
        <MenuOption onSelect={() => {
            onSelect();
            return false;
        }}>
            <LinearGradient
                colors={isSelected ? ['#ffffff', '#ebccff'] : ['#b6b2db', '#828093']}
                start={{ x: 0.6, y: 0.2 }}
                style={[repeatingElementsStyles.influencePageSelector, styles.gradientContainer]}
            >
                <Text style={styles.pageText}>{pageText}</Text>
            </LinearGradient>
        </MenuOption>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        // Add any additional styles for the LinearGradient container here
    } as ViewStyle,
    pageText: {
        fontSize: 14,
        color: '#202316',
        fontWeight: '600',
        fontFamily: 'serif',
    } as TextStyle,
});

export default InfluencePageSelector;