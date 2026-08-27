import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuth } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { ProfileProvider, useProfile } from "../context/ProfileContext";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ProfileFormScreen from "../screens/ProfileFormScreen";
import HomeScreen from "../screens/HomeScreen";
import CaptureScreen from "../screens/CaptureScreen";
import ResultScreen from "../screens/ResultScreen";
import HistoryScreen from "../screens/HistoryScreen";
import RealisationDetailScreen from "../screens/RealisationDetailScreen";
import AccountScreen from "../screens/AccountScreen";

const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: "#0F172A" },
  headerTintColor: "white",
  headerTitleStyle: { fontWeight: "700" },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={headerOptions}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: "ProStory" }} />
      <HomeStack.Screen name="Capture" component={CaptureScreen} options={{ title: "Nouvelle réalisation" }} />
      <HomeStack.Screen name="Result" component={ResultScreen} options={{ title: "Résultat IA" }} />
    </HomeStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={headerOptions}>
      <AccountStack.Screen name="Account" component={AccountScreen} options={{ title: "Compte" }} />
      <AccountStack.Screen
        name="EditProfile"
        component={ProfileFormScreen}
        options={{ title: "Modifier mon profil" }}
      />
    </AccountStack.Navigator>
  );
}

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={headerOptions}>
      <HistoryStack.Screen name="History" component={HistoryScreen} options={{ title: "Mes réalisations" }} />
      <HistoryStack.Screen
        name="RealisationDetail"
        component={RealisationDetailScreen}
        options={{ title: "Réalisation" }}
      />
    </HistoryStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ ...headerOptions, headerShown: false }}>
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Accueil", tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tabs.Screen
        name="HistoryTab"
        component={HistoryStackNavigator}
        options={{ title: "Mes réalisations", tabBarIcon: () => <Text>📋</Text> }}
      />
      <Tabs.Screen
        name="AccountTab"
        component={AccountStackNavigator}
        options={{ title: "Compte", tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tabs.Navigator>
  );
}

function AuthedNavigator() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  if (!profile) {
    // Premier onboarding : on force la saisie du métier + infos avant
    // d'accéder au reste de l'appli.
    return (
      <AppProvider>
        <ProfileFormScreen />
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <MainTabs />
    </AppProvider>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? (
        <ProfileProvider>
          <AuthedNavigator />
        </ProfileProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" },
});
