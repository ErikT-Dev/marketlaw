import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuButtonProps {
    title: string;
    onPress: () => void;
    disabled: boolean;
    color: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, onPress, disabled, color }) => (
    <LinearGradient
        style={styles.menuGradient}
        start={{ x: 0.5, y: 0.3 }}
        colors={['rgba(232, 184, 165, 0.95)', 'rgba(255, 192, 120, 0.65)']}
    >
        <Pressable
            style={({ pressed }) => [
                styles.menuButton,
                { backgroundColor: pressed ? 'rgba(255, 168, 97, 0.46)' : 'rgba(255, 205, 125, 0.18)' }
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[styles.menuButtonText, { color }]}>{title}</Text>
        </Pressable>
    </LinearGradient>
);

const styles = StyleSheet.create({
    menuGradient: {
        marginVertical: 5,
        borderRadius: 5,
    },
    menuButton: {
        width: 200,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonText: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 21,
        fontWeight: '700',
    },
});

export default MenuButton;