import { StyleSheet } from 'react-native';

export const menuStyles = StyleSheet.create({
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingHorizontal: 10,
        paddingVertical: 5,
        minHeight: 35
    },
    actionOption: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 3,
    },
    popOverText: {
        fontFamily: 'sans-serif-condensed',
        color: '#4a3632',
        fontWeight: '400',
        fontSize: 15
    },
    popOverBody: {
        width: 120,
        padding: 10,
        backgroundColor: '#f0d5a8',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    }
})