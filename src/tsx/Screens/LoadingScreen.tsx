import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackNavigatorParamsList } from '../../../App';
import { preloadAllImages } from '../../store/data';

type LoadingScreenNavigationProp = NativeStackNavigationProp<RootStackNavigatorParamsList, 'Loading'>;

type Props = {
    navigation: LoadingScreenNavigationProp;
};

const LoadingScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        const loadImages = async () => {
            try {
                await preloadAllImages();
                navigation.replace('MainMenu');
            } catch (error) {
                console.error('Failed to preload images:', error);
                navigation.replace('MainMenu');
            }
        };

        loadImages();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../../assets/backgrounds/hafidh-satyanto-UytSb_a2YE0-unsplash.jpg')}
                style={styles.splashImage}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 84, 59, 0.5)',
        flexDirection: 'column'
    },
    splashImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6
    },
});

export default LoadingScreen;