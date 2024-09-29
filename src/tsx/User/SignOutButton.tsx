import { useDispatch } from 'react-redux';
import { Text, Pressable } from 'react-native';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { logOut } from '../../store';

export default function SignOutButton() {
    const dispatch = useDispatch()
    const signOut = async () => {
        await FIREBASE_AUTH.signOut()
        dispatch(logOut())
    }
    return (
        <Pressable style={({ pressed }) => [{
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: 'black',
            paddingHorizontal: 25,
            height: 50,
            backgroundColor: pressed ? '#894e26' : '#7d3a0e',
            borderTopRightRadius: 10
        }]} onPress={signOut}>
            <Text adjustsFontSizeToFit={true}
                numberOfLines={1} style={{ fontFamily: 'sans-serif-condensed', fontSize: 17, fontWeight: "500", color: '#fff9e2' }}>Sign Out</Text>
        </Pressable>
    )
}
