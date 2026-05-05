import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import {
  AdminScreen,
  DashboardScreen,
  HomeScreen,
  LoginScreen,
  MessagesScreen,
  OffersScreen,
  PrintOnDemandScreen,
  ProfileScreen,
  RegisterScreen,
} from '../screens/Placeholders';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
    primary: colors.red,
    card: colors.white,
    border: colors.border,
    text: colors.ink,
  },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack({ isAdmin }) {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="PrintOnDemand" component={PrintOnDemandScreen} options={{ title: 'Print on Demand' }} />
      {isAdmin ? <Stack.Screen name="Admin" component={AdminScreen} /> : null}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppStack isAdmin={Boolean(user.isAdmin)} /> : <AuthStack />}
    </NavigationContainer>
  );
}

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.white,
  },
  headerTitleStyle: {
    fontWeight: '800',
    color: colors.ink,
  },
  headerTintColor: colors.redDark,
  contentStyle: {
    backgroundColor: colors.white,
  },
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
