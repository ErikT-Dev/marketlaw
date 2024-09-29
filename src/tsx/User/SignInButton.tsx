import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useDispatch } from 'react-redux';
import { Text, View, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { logIn } from '../../store';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { showMessage, hideMessage } from 'react-native-flash-message';
import * as NavigationBar from 'expo-navigation-bar';

export default function SignInButton() {
    const dispatch = useDispatch()
    const [emailForm, setEmailForm] = useState('')
    const [passwordForm, setPasswordForm] = useState('')
    const [loading, setLoading] = useState(false)
    const auth = FIREBASE_AUTH

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const displayName = user.displayName
                const email = user.email
                const uid = user.uid
                dispatch(logIn({ displayName, email, uid }))
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, emailForm, passwordForm)
            setEmailForm('')
            setPasswordForm('')
        } catch (error) {
            console.log(error)
            showMessage({
                message: `Invalid email or password.`,
                type: "danger",
                onPress: () => hideMessage()
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Menu renderer={renderers.SlideInMenu}
            name='SignIn'
            onClose={() => NavigationBar.setVisibilityAsync('hidden')}
            onOpen={() => {
                NavigationBar.setBackgroundColorAsync('rgba(191, 92, 77, 0)')
                NavigationBar.setPositionAsync('absolute')
            }}>
            <MenuTrigger>
                <View
                    style={{
                        backgroundColor: '#c52121',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderColor: 'black',
                        paddingHorizontal: 25,
                        height: 50,
                    }}>
                    <Text adjustsFontSizeToFit={true}
                        numberOfLines={1} style={{ fontFamily: 'sans-serif-condensed', fontSize: 17, fontWeight: "500", color: '#caffd1' }}>Login</Text>
                </View>
            </MenuTrigger>
            <MenuOptions
                customStyles={{
                    optionsContainer: {
                        width: '50%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: "row",
                        borderTopWidth: 1,
                        borderRightWidth: 1,
                        borderTopRightRadius: 5,
                        borderColor: '#caffd1',
                        backgroundColor: '#bd3333'
                    }
                }}>
                <MenuOption>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: "row",
                        borderColor: 'black',
                        paddingVertical: 20,
                        width: '100%'
                    }}>
                        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 21, fontWeight: "500", color: '#caffd1' }}>Login</Text>
                            <View style={{ borderBottomWidth: 1, borderTopWidth: 1, marginVertical: 15, width: '70%', justifyContent: 'center', alignItems: 'center', borderColor: '#9ba2b3' }}>
                                <TextInput
                                    keyboardType='email-address'
                                    placeholder='Email...'
                                    placeholderTextColor={'#caffd1'}
                                    autoCapitalize='none'
                                    style={repeatingElementsStyles.textInput}
                                    onChangeText={(text) => setEmailForm(text)}
                                    value={emailForm}
                                ></TextInput>
                                <TextInput
                                    placeholder='Password...'
                                    placeholderTextColor={'#caffd1'}
                                    autoCapitalize='none'
                                    style={repeatingElementsStyles.textInput}
                                    onChangeText={(text) => setPasswordForm(text)}
                                    value={passwordForm}
                                    secureTextEntry={true}
                                ></TextInput>
                            </View>
                            {loading ? <ActivityIndicator
                                size="large"
                                color="#caffd1"
                            /> :
                                <>
                                    <Pressable
                                        onPress={signIn}
                                        style={{
                                            backgroundColor: '#caffd1',
                                            width: 100,
                                            borderRadius: 15,
                                            paddingHorizontal: 15,
                                            paddingVertical: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 16, fontWeight: "500", color: '#894537' }}>Login</Text>
                                    </Pressable>
                                </>
                            }
                        </View>
                    </View>
                </MenuOption>
            </MenuOptions>
        </Menu>
    )
}
