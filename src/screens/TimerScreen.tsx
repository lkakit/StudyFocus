import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import CountdownCircle from '../components/CountdownCircle';
import { SessionConfig, SessionProgress, HistoryItem } from '../types/session.types';
import { RouteProp } from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const responsiveHeight = (percentage: number) => height * (percentage / 100);
const responsiveWidth = (percentage: number) => width * (percentage / 100);
const responsiveFontSize = (baseSize: number) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(baseSize * scale);
};

interface TimerScreenProps {
  addHistoryItem: (item: HistoryItem) => void;
  route: RouteProp<any, any>;
  navigation: any;
}

// When components first mounts
const getDefaultSessionConfig = (): SessionConfig => {
  return {
    taskTitle: "My Task",
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    rounds: 4,
    roundsUntilLongBreak: 4,
    workflowType: 'pomodoro',
  };
}

const TimerScreen: React.FC<TimerScreenProps> = ({ addHistoryItem, route }) => {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(getDefaultSessionConfig());

  // First session type (consistent for every workflow type)
  const [sessionInfo, setSessionInfo] = useState({
    type: 'Work',
    round: 1,
    totalRounds: 4
  });

  const [sessionQuote, setSessionQuote] = useState("Stay Focused!");
  
  // To trigger timer to re-render when starting a new task
  const [sessionKey, setSessionKey] = useState(Date.now());
  
  // Update state when route params change
  useEffect(() => {
    if (route.params) {
      const { sessionConfig: newSessionConfig } = route.params;
      
      if (newSessionConfig) {
        setSessionConfig(newSessionConfig);
        setSessionInfo({
          type: 'work',
          round: 1,
          totalRounds: newSessionConfig.rounds || 4
        });
        setSessionKey(Date.now()); // Trigger timer re-render
        setSessionQuote("Stay Focused!");
      }
    }
  }, [route.params]);


  const handleSessionComplete = (progress: SessionProgress) => {
    setSessionInfo({
      type: progress.currentSession.type,
      round: progress.currentSession.round,
      totalRounds: progress.currentSession.totalRounds,
    });

    // Update quote based on session type
    const quotes = {
      work: "Stay Focused!",
      break: "Take a Break!",
      longBreak: "Relax and Recharge!"
    };
    setSessionQuote(quotes[progress.currentSession.type]);
  };

  const getTotalSessionTime = (config: SessionConfig): number => {
    const totalWorkTime = config.workTime * config.rounds;
    const totalBreakTime = config.breakTime * (config.rounds - 1);
    const longBreaks = Math.floor(config.rounds / config.roundsUntilLongBreak);
    const additionalLongBreakTime = longBreaks * (config.longBreakTime - config.breakTime);
    
    return totalWorkTime + totalBreakTime + additionalLongBreakTime;
  };

  const handleAllSessionsComplete = (progress: SessionProgress) => {
    setSessionQuote("Session completed! 🎉");

    // Create history item from the completed session
    const historyItem: HistoryItem = {
      id: Date.now().toString(), 
      taskName: sessionConfig.taskTitle, 
      date: new Date(),
      duration: progress.totalElapsedTime,
      completedRounds: progress.completedRounds,
      totalRounds: progress.currentSession.totalRounds,
      sessionConfig: sessionConfig,
      completionPercentage: Math.round((progress.totalElapsedTime / getTotalSessionTime(sessionConfig)) * 100),
      totalElapsedTime: progress.totalElapsedTime,
    };
    
    // Save to history
    addHistoryItem(historyItem);
  };

  const getSessionLabel = () => {
    switch (sessionInfo.type) {
      case 'work': return 'Work Session';
      case 'break': return 'Short Break';
      case 'longBreak': return 'Long Break';
      case 'completed': return 'Session Completed';
      default: return 'Work Session';
    }
  };

  return (
    <View style={styles.container}>
      <Svg 
        width={width} 
        height={height} 
        preserveAspectRatio="xMinYMin slice"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          {/* 45-degree gradient - diagonal from top-left to bottom-right */}
          <LinearGradient id="grad45" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F2BAE7" />
            <Stop offset="40%" stopColor="#F3E0F5" />
            <Stop offset="100%" stopColor="#AE91E1" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#grad45)" />
      </Svg>

      <View style={styles.roundedContainer}>
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{sessionConfig.taskTitle}</Text>
        </View>
        <Text style={styles.sessionQuote}>{sessionQuote}</Text>
        {/* Countdown timer + controls */}
        <CountdownCircle
          sessionConfig={sessionConfig}
          onSessionComplete={handleSessionComplete} // e.g. work -> break
          onAllSessionsComplete={handleAllSessionsComplete} // Entire workflow completed (all rounds)
          size={160}
          strokeWidth={14}
          textStyle={styles.timerText}
          key={sessionKey}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sessionInfo}>
          {getSessionLabel()} • Round {sessionInfo.round} of {sessionInfo.totalRounds}
        </Text>
        <View style={styles.workflowInfo}>
          <Text style={styles.tomatoEmoji}>
            {sessionConfig.workflowType === 'pomodoro' ? '🍅' : 
            sessionConfig.workflowType === 'university' ? '🎓' :
            sessionConfig.workflowType === '52-17' ? '⏱️' : '⚙️'}
          </Text>
          <Text style={styles.sessionInfo}>
            {sessionConfig.workflowType === 'pomodoro' ? 'Pomodoro' : 
            sessionConfig.workflowType === 'university' ? 'University Focus' :
            sessionConfig.workflowType === '52-17' ? '52/17 Method' : 'Custom'}
          </Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roundedContainer: {
    height: responsiveHeight(73), // 75% of screen height
    backgroundColor: '#EBDAFF',
    borderBottomLeftRadius: 100, // Responsive border radius
    borderBottomRightRadius: 100,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: responsiveWidth(5), // 5% of screen width
    paddingTop: Platform.OS === 'ios' ? responsiveHeight(8) : responsiveHeight(6), // Responsive safe area
  },
  headerTitle: {
    position: 'absolute',
    top: 60,
    left: 20,
    fontSize: 26,
    color: '#816ACE',
    zIndex: 1,
    fontFamily: 'Rubik-Regular',
  },
  taskTitleContainer: {
    alignSelf: 'center', // Or 'center' if you want it centered
    backgroundColor: '#816ACE',
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(1),
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: responsiveHeight(8),
    marginBottom: responsiveHeight(4), // Space before timer content
    minWidth: responsiveWidth(50), // Minimum 40% of screen width
    maxWidth: responsiveWidth(80),
  },
  taskTitle: {
    color: '#FFFFFF',
    alignSelf: 'center',
    fontSize: responsiveFontSize(22),
    fontWeight: '600',
    fontFamily: 'Rubik-Regular',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionQuote: {
    fontSize: responsiveFontSize(22),
    color: '#816ACE',
    fontFamily: 'Rubik-Regular',
    alignSelf: 'center',
    marginBottom: responsiveHeight(5),
  },
  timer: {
    fontSize: responsiveFontSize(54),
    color: '#816ACE',
    fontFamily: 'Rubik-Regular',
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  sessionInfo: {
    fontSize: responsiveFontSize(20),
    color: '#816ACE',
    fontFamily: 'Rubik-Regular',
  },
  tomatoEmoji: {
    fontSize: responsiveFontSize(18),
    marginRight: 8,
  },
  workflowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default TimerScreen;