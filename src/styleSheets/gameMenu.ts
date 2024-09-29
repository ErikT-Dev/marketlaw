import { StyleSheet } from 'react-native';

export const gameMenuStyles = StyleSheet.create({
    menuButton: {
        backgroundColor: '#ffcd7d',
        width: '28%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f7ecc8',
        margin: 5,
        padding: 5
    }, menuBackground: {
        flex: 1,
    },
    menuScreen: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 84, 59, 0.5)',
        flexDirection: 'column'
    },
    menuGradient: {
        width: '28%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        borderWidth: 0.8,
        borderColor: '#f7ecc8',
        margin: 5,
    }
})