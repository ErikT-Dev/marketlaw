import { RawCardDataItem } from "./interfaces/rawCardDataItem";
import { CardDataItem } from "./interfaces/cardDataItem";
import { TypeCalendarItem } from "./interfaces/typeCalendarItem";
import { initializeCardData } from "./functions/initializeCardData";
import { types } from "./interfaces/gameTypes";
import { ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';

type WebpackContext = {
    keys(): string[];
    <T>(id: string): T;
    resolve(id: string): string;
    id: string;
};

interface IconItem {
    key: string;
    src: ImageSourcePropType;
}

const icons: IconItem[] = [
    { key: 'tier', src: require('../../assets/icons/cube-icon.png') },
    { key: 'cost', src: require('../../assets/icons/dollar-icon.png') },
    { key: 'funds', src: require('../../assets/icons/dollar-icon.png') },
    { key: 'workforce', src: require('../../assets/icons/home-icon.png') },
    { key: 'quality', src: require('../../assets/icons/shield-checkmark-black-icon.png') },
    { key: 'satisfaction', src: require('../../assets/icons/thumbs-up-black-icon.png') },
    { key: 'workforce', src: require('../../assets/icons/home-icon.png') },
    { key: 'influenceQuality', src: require('../../assets/icons/shield-checkmark-black-icon.png') },
    { key: 'influenceSatisfaction', src: require('../../assets/icons/thumbs-up-black-icon.png') },
    { key: 'product', src: require('../../assets/icons/wagon-icon.png') },
    { key: 'sales', src: require('../../assets/icons/area-chart-icon.png') },
    { key: 'income', src: require('../../assets/icons/hand-money-income-note-icon.png') },
    { key: 'bonus', src: require('../../assets/icons/present-icon.png') },
    { key: 'Beautification', src: require('../../assets/icons/tree-icon.png') },
    { key: 'Food', src: require('../../assets/icons/apple-fruits-icon.png') },
    { key: 'Suburban Housing', src: require('../../assets/icons/barrier-boundary-icon.png') },
    { key: 'Education', src: require('../../assets/icons/book-icon.png') },
    { key: 'Service', src: require('../../assets/icons/dish-cap-icon.png') },
    { key: 'Mass Transit', src: require('../../assets/icons/bus-icon.png') },
    { key: 'Retail', src: require('../../assets/icons/cart-black-icon.png') },
    { key: 'City Housing', src: require('../../assets/icons/mall-icon.png') },
    { key: 'Raw Material', src: require('../../assets/icons/saw-icon.png') },
    { key: 'Luxury', src: require('../../assets/icons/diamond-icon.png') },
    { key: 'Utility', src: require('../../assets/icons/drop-icon.png') },
    { key: 'Heavy Industry', src: require('../../assets/icons/factory-icon.png') },
    { key: 'Farm', src: require('../../assets/icons/farm-tractor-icon.png') },
    { key: 'Forestry', src: require('../../assets/icons/forest-tree-icon.png') },
    { key: 'Grain', src: require('../../assets/icons/sickle-color-icon.png') },
    { key: 'Leisure', src: require('../../assets/icons/beach-umbrella-sand-icon.png') },
    { key: 'Rental Space', src: require('../../assets/icons/key-icon.png') },
    { key: 'Power Plant', src: require('../../assets/icons/electric-plug-icon.png') },
    { key: 'Health', src: require('../../assets/icons/medical-briefcase-icon.png') },
    { key: 'High Tech', src: require('../../assets/icons/microchip-icon.png') },
    { key: 'Mine', src: require('../../assets/icons/mining-icon.png') },
    { key: 'Safety', src: require('../../assets/icons/police-cap-icon.png') },
    { key: 'Sea', src: require('../../assets/icons/ship-icon.png') },
    { key: 'Town Housing', src: require('../../assets/icons/property-color-icon.png') },
    { key: 'Mass Media', src: require('../../assets/icons/video-camera-icon.png') },
    { key: 'Alcohol', src: require('../../assets/icons/wine-bottle-glass-icon.png') },
    { key: 'Mercantile', src: require('../../assets/icons/truck-icon.png') },
    { key: 'Low Wealth', src: require('../../assets/icons/farmer-color-icon.png') },
    { key: 'Office', src: require('../../assets/icons/landline-icon.png') },
    { key: 'Turns played', src: require('../../assets/icons/sand-clock-half-icon.png') },
    { key: 'Cards played', src: require('../../assets/icons/transparent-background-icon.png') },
    { key: 'Light Industry', src: require('../../assets/icons/factory-pollution-icon.png') },
    { key: 'Finance', src: require('../../assets/icons/briefcase-icon.png') },
    { key: 'influence', src: require('../../assets/icons/bank-building-icon.png') },
    { key: 'Cards in hand', src: require('../../assets/icons/hand-icon.png') },
    { key: 'Build pass', src: require('../../assets/icons/default-icon.png') },
    { key: 'Has Build pass', src: require('../../assets/icons/default-icon.png') },
    { key: 'Petroleum', src: require('../../assets/icons/oil-icon.png') },
    { key: 'Culture', src: require('../../assets/icons/music-icon.png') },
    { key: 'Medal', src: require('../../assets/icons/gold-medal-icon.png') },
]

const rawCardData = Object.values(require('../../MarekData.json')) as RawCardDataItem[];
const cardData: CardDataItem[] = initializeCardData(rawCardData);

const typesCalendar = Object.values(require('../../TypesCalendar.json')) as TypeCalendarItem[];

const cardImages = (require as any).context('../../assets/cardImages', true, /\.jpg$/) as WebpackContext;
cardImages.keys().forEach((image: string) => cardImages(image));

const getCardImgByCardId = (cardIndex: number): number => {
    return cardImages.keys().indexOf(`./${cardData[cardIndex - 1].imgName}`) + 51;
};


const backgrounds = [
    require('../../assets/backgrounds/dana-devolk-E0BdstzaO8E-unsplash.jpg') as ImageSourcePropType,
    require('../../assets/backgrounds/hafidh-satyanto-UytSb_a2YE0-unsplash.jpg') as ImageSourcePropType,
];

const cardDrawAlgo = {
    tier1Start: 1,
    tier1Modifier: 14,
    tier3Start: 1.52,
    tier3Modifier: 17
}

const currentSeason = 1

const getImageUri = (source: ImageSourcePropType): string | undefined => {
    if (typeof source === 'number') {
        return Asset.fromModule(source).uri;
    } else if (typeof source === 'object' && source !== null && 'uri' in source) {
        return source.uri;
    }
    return undefined;
};

export const preloadAllImages = async () => {
    const iconImagePromises = icons.map(icon => {
        const uri = getImageUri(icon.src);
        return uri ? Image.prefetch(uri) : Promise.resolve();
    });

    const cardImagePromises = cardData.map(card => {
        const imageSource = getCardImgByCardId(card.cardId);
        const uri = getImageUri(imageSource);
        return uri ? Image.prefetch(uri) : Promise.resolve();
    });

    const backgroundImagePromises = backgrounds.map(bg => {
        const uri = getImageUri(bg);
        return uri ? Image.prefetch(uri) : Promise.resolve();
    });

    const splashImageUri = getImageUri(require('../../assets/splash6.png'));
    const splashImagePromise = splashImageUri ? Image.prefetch(splashImageUri) : Promise.resolve();

    await Promise.all([...iconImagePromises, ...cardImagePromises, ...backgroundImagePromises, splashImagePromise]);
};

export { cardData, typesCalendar, getCardImgByCardId, backgrounds, types, icons, cardDrawAlgo, currentSeason }

