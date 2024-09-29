import { StyleSheet } from 'react-native';

export const repeatingElementsStyles = StyleSheet.create({
    rulesElement: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginEnd: 7
    },
    typesCell: {
        flexDirection: 'row',
    },
    statsCell: {
        flex: 0.2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    tutorialText: {
        fontSize: 15,
        color: '#392a4a',
        fontWeight: "600",
        fontFamily: 'sans-serif-condensed'
    },
    tutorialElement: {
        flexDirection: 'row',
        flexWrap: "wrap",
        height: 25
    },
    textInput: {
        color: '#d1deff',
        height: 40,
        paddingLeft: 20,
        width: '100%',
        fontSize: 17,
        borderWidth: 1,
        margin: 10,
        borderColor: '#c9ccd4'
    },
    influencePageSelector: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
        borderRadius: 0,
        borderWidth: 0.3,
        borderColor: 'black',
        paddingVertical: 5,
        width: 70,
    },
    influenceOption: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 5,
    }
})