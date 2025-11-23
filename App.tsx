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

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            // Active tab color
            tabBarActiveTintColor: '#816ACE', // Your purple color
            // Inactive tab color  
            tabBarInactiveTintColor: '#A5A5A5', // Gray when not selected
          }}
        
        >
          <Tab.Screen 
            name="Timer" 
            component={TimerScreen}
            options={{
              headerShown: false,
              title: 'Timer',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="timer-outline" size={size} color={color} />
              ),
            }}
          />
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
            component={HistoryScreen}
            options={{
              headerShown: false,
              title: 'History',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
