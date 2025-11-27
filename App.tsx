import React, { useState } from 'react';
import { StatusBar, useColorScheme} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import TimerScreen from './src/screens/TimerScreen.tsx';
import TasksScreen from './src/screens/TasksScreen.tsx';
import HistoryScreen from './src/screens/HistoryScreen.tsx';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HistoryItem } from './src/types/session.types';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const addHistoryItem = (item: HistoryItem) => {
    setHistoryItems(prev => [...prev, item]);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#816ACE',
            tabBarInactiveTintColor: '#A5A5A5',
          }}
        >
          <Tab.Screen 
            name="Timer" 
            options={{
              headerShown: false,
              title: 'Timer',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="timer-outline" size={size} color={color} />
              ),
            }}
          >
            {(props) => <TimerScreen {...props} addHistoryItem={addHistoryItem} />}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Tasks" 
            component={TasksScreen}
            options={{
              headerShown: false,
              title: 'Tasks',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tab.Screen 
            name="History" 
            options={{
              headerShown: false,
              title: 'History',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <HistoryScreen 
                historyItems={historyItems} 
                setHistoryItems={setHistoryItems} 
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
