import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JerseyWebViewScreen from "../screens/JerseyWebViewScreen";
import MessagesScreen from "../screens/MessagesScreen";
import OffersScreen from "../screens/OffersScreen";
import AdminScreen from "../screens/AdminScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1d4ed8",
        tabBarInactiveTintColor: "#64748b"
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="MessagesTab" component={MessagesScreen} options={{ title: "Messages" }} />
      <Tab.Screen name="OffersTab" component={OffersScreen} options={{ title: "Offers" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
      {user?.isAdmin ? <Tab.Screen name="AdminTab" component={AdminScreen} options={{ title: "Admin" }} /> : null}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerStyle: { backgroundColor: "#f8fafc" },
          headerTintColor: "#0f172a",
          contentStyle: { backgroundColor: "#f8fafc" }
        }}
      >
        <Stack.Screen
          name="Home"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Offers" component={OffersScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Jersey" component={JerseyWebViewScreen} options={{ title: "3D Jersey" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
