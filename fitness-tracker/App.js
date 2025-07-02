import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import LogWorkoutScreen from './src/screens/LogWorkoutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GenerateWorkoutScreen from './src/screens/GenerateWorkoutScreen';
import { DatabaseProvider } from './src/context/DatabaseContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <DatabaseProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Log Workout') {
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                } else if (route.name === 'History') {
                  iconName = focused ? 'list' : 'list-outline';
                } else if (route.name === 'Generate') {
                  iconName = focused ? 'bulb' : 'bulb-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#6200ee',
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: '#6200ee',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Log Workout" component={LogWorkoutScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Generate" component={GenerateWorkoutScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </DatabaseProvider>
    </PaperProvider>
  );
}