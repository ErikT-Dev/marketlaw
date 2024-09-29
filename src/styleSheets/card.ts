import { StyleSheet } from 'react-native';

export const cardStyles = StyleSheet.create({
    cardBody: {
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        height: 45,
    },
    cardText: {
        fontFamily: 'sans-serif-condensed',
        color: '#f7ecc8',
        fontWeight: '400',
        fontSize: 11
    },
    playedCardBody: {
        borderColor: 'black',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        borderRadius: 2,
        height: 30,
        width: '50%',
    },
    playedCardText: {
        fontFamily: 'serif',
        color: '#f7ecc8',
        fontSize: 12,
        fontWeight: '400'
    }
})