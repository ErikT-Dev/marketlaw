import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useDispatch } from 'react-redux';
import { Text, View, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useState } from 'react';
import { FIREBASE_AUTH } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { onAuthStateChanged, } from 'firebase/auth';
import { logIn } from '../../store';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { showMessage, hideMessage } from 'react-native-flash-message';
import * as NavigationBar from 'expo-navigation-bar';

export default function SignUpButton() {
    const dispatch = useDispatch()
    const [emailForm, setEmailForm] = useState('')
    const [usernameForm, setUsernameForm] = useState('')
    const [passwordForm, setPasswordForm] = useState('')
    const [loading, setLoading] = useState(false)
    const auth = FIREBASE_AUTH

    const signUp = async () => {
        setLoading(true)
        try {
            await createUserWithEmailAndPassword(auth, emailForm, passwordForm)
                .then(async ({ user }) => {
                    await updateProfile(user, { displayName: usernameForm });
                    onAuthStateChanged(FIREBASE_AUTH, (user) => {
                        const displayName = user?.displayName
                        const email = user?.email
                        const uid = user?.uid
                        dispatch(logIn({ displayName, email, uid }))
                    })
                })
        }
        catch (error) {
            console.log(error.message)
            const message = error.code === 'auth/invalid-email' ? 'Invalid email' : error.code === 'auth/invalid-password' ? 'Invalid password' : error.code === 'auth/invalid-displayName' ? 'Invalid username' : 'Something went wrong...'
            showMessage({
                message: `${message}`,
                type: "danger",
                onPress: () => hideMessage()
            })
        } finally {
            setEmailForm('')
            setPasswordForm('')
            setUsernameForm('')
            setLoading(false)
        }
    }
    return (
        <Menu
            renderer={renderers.SlideInMenu}
            onClose={() => NavigationBar.setVisibilityAsync('hidden')}
            onOpen={() => {
                NavigationBar.setBackgroundColorAsync('rgba(191, 92, 77, 0)')
                NavigationBar.setPositionAsync('absolute')
            }}>
            <MenuTrigger>
                <View style={{
                    backgroundColor: '#7d3a0e',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: 'black',
                    paddingHorizontal: 25,
                    height: 50,
                    borderTopRightRadius: 10
                }}>
                    <Text adjustsFontSizeToFit={true}
                        numberOfLines={1} style={{ fontFamily: 'sans-serif-condensed', fontSize: 17, fontWeight: "500", color: '#fff9e2' }}>Sign Up</Text>
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
                        borderColor: '#fff9e2',
                        backgroundColor: '#b06333'
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
                        <View behavior='padding' style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 21, fontWeight: "500", color: '#fff9e2' }}>Sign Up</Text>
                            <View style={{ borderBottomWidth: 1, borderTopWidth: 1, marginVertical: 15, width: '70%', justifyContent: 'center', alignItems: 'center', borderColor: '#9ba2b3' }}>
                                <TextInput
                                    placeholder='Username...'
                                    placeholderTextColor={'#fff9e2'}
                                    autoCapitalize='none'
                                    style={repeatingElementsStyles.textInput}
                                    onChangeText={(text) => setUsernameForm(text)}
                                    value={usernameForm}
                                ></TextInput>
                                <TextInput
                                    placeholder='Email...'
                                    placeholderTextColor={'#fff9e2'}
                                    autoCapitalize='none'
                                    style={repeatingElementsStyles.textInput}
                                    onChangeText={(text) => setEmailForm(text)}
                                    value={emailForm}
                                ></TextInput>
                                <TextInput
                                    placeholder='Password...'
                                    placeholderTextColor={'#fff9e2'}
                                    autoCapitalize='none'
                                    style={repeatingElementsStyles.textInput}
                                    onChangeText={(text) => setPasswordForm(text)}
                                    value={passwordForm}
                                    secureTextEntry={true}
                                ></TextInput>
                            </View>
                            {loading ? <ActivityIndicator
                                size="large"
                                color="#fff9e2"
                            /> :
                                <>
                                    <Pressable
                                        onPress={signUp}
                                        style={{
                                            backgroundColor: '#fff9e2',
                                            width: 100,
                                            borderRadius: 15,
                                            paddingHorizontal: 15,
                                            paddingVertical: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <Text style={{ fontFamily: 'sans-serif-condensed', fontSize: 16, fontWeight: "500", color: '#894537' }}>Sign Up</Text>
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
