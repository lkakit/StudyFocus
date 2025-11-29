import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import TimerScreen from './src/screens/TimerScreen';
import TasksScreen from './src/screens/TasksScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { HistoryItem } from './src/types/session.types';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const addHistoryItem = (item: HistoryItem) => {
    // newest first
    setHistoryItems(prev => [item, ...prev]);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#816ACE',
            tabBarInactiveTintColor: '#A7A7A7',
            tabBarIcon: ({ color, size }) => {
              if (route.name === 'Timer') {
                return <Ionicons name="timer-outline" size={size} color={color} />;
              }
              if (route.name === 'Tasks') {
                return <Ionicons name="list-outline" size={size} color={color} />;
              }
              return <Ionicons name="time-outline" size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Timer"
            children={props => (
              <TimerScreen
                {...props}
                addHistoryItem={addHistoryItem}
              />
            )}
          />

          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
          />

          <Tab.Screen
            name="History"
            children={props => (
              <HistoryScreen
                {...props}
                historyItems={historyItems}
                setHistoryItems={setHistoryItems}
              />
            )}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
