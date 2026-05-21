import { useState, useEffect } from 'react';
import { Image, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { IMG, ROUTES } from '../../utils';
import Colors from '../../utils/colors';
import { authLogin } from '../../app/actions';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Login failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={IMG.LOGO}
        style={{ width: 240, height: 80, marginBottom: 40 }}
        resizeMode="contain"
      />

      <View style={{ width: '100%' }}>
        <CustomTextInput
          label={'Username'}
          placeholder={'Enter Username'}
          value={username}
          onChangeText={val => setUsername(val)}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
        <CustomTextInput
          label={'Password'}
          placeholder={'Enter Password'}
          value={password}
          onChangeText={val => setPassword(val)}
          containerStyle={{
            padding: 5,
          }}
          textStyle={{
            borderRadius: 10,
            color: 'black',
            marginLeft: 10,
            fontWeight: 'bold',
          }}
        />
      </View>

      <CustomButton
        label={'LOGIN'}
        containerStyle={{
          backgroundColor: Colors.primary,
          borderRadius: 10,
          marginVertical: 20,
          width: '85%',
        }}
        textStyle={{
          color: 'white',
          fontWeight: 'bold',
        }}
        onPress={() => {
          if (username === '' || password === '') {
            Alert.alert(
              'Invalid Credentials',
              'Please enter valid credentials',
            );

            return;
          }

          dispatch(
            authLogin({
              username,
              password,
            }),
          );
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>Create an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.REGISTER)}>
          <Text
            style={{
              color: Colors.secondary,
              marginLeft: 5,
              fontWeight: 'bold',
            }}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
