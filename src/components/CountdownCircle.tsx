import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { 
  SessionConfig, 
  Session, 
  SessionProgress, 
} from '../types/session.types';

const { width, height } = Dimensions.get('window');

const responsiveHeight = (percentage: number) => height * (percentage / 100);
const responsiveWidth = (percentage: number) => width * (percentage / 100);
const responsiveFontSize = (baseSize: number) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(baseSize * scale);
};

interface CountdownCircleProps {
  sessionConfig: SessionConfig;
  onSessionComplete?: (progress: SessionProgress) => void;
  onAllSessionsComplete?: () => void;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  textStyle?: any;
}

// Helper functions outside component
const getInitialSession = (config: SessionConfig): Session => {
  return {
    type: 'work',
    duration: config.workTime,
    round: 1,
    totalRounds: config.rounds,
  };
};

const getNextSession = (current: Session, config: SessionConfig): Session | null => {
  if (current.type === 'work') {
    const shouldTakeLongBreak = current.round % config.roundsUntilLongBreak === 0;
    
    if (shouldTakeLongBreak) {
      return {
        type: 'longBreak',
        duration: config.longBreakTime,
        round: current.round,
        totalRounds: config.rounds,
      };
    } else {
      return {
        type: 'break',
        duration: config.breakTime,
        round: current.round,
        totalRounds: config.rounds,
      };
    }
  } else {
    const nextRound = current.round + 1;
    
    if (nextRound > config.rounds) {
      return null;
    }
    
    return {
      type: 'work',
      duration: config.workTime,
      round: nextRound,
      totalRounds: config.rounds,
    };
  }
};

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const CountdownCircle: React.FC<CountdownCircleProps> = ({
  sessionConfig,
  onSessionComplete,
  onAllSessionsComplete,
  size = 140,
  strokeWidth = 12,
  color = '#816ACE',
}) => {
  // Use useMemo to calculate initial values
  const initialSession = useMemo(() => getInitialSession(sessionConfig), [sessionConfig]);
  
  const [sessionProgress, setSessionProgress] = useState<SessionProgress>(() => ({
    currentSession: initialSession,
    completedRounds: 0,
    isCompleted: false,
  }));
  
  const [timeLeft, setTimeLeft] = useState(() => initialSession.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2 * 1.3;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress (0 to 1)
  const progress = timeLeft / sessionProgress.currentSession.duration;
  const strokeDashoffset = circumference * (1 - progress);

  const getSessionColor = () => {
    switch (sessionProgress.currentSession.type) {
      case 'work': return '#816ACE';
      case 'break': return '#4CAF50';
      case 'longBreak': return '#2196F3';
      default: return '#816ACE';
    }
  };

  // Start timer
  const startTimer = () => {
    if (intervalRef.current || sessionProgress.isCompleted || isTaskCompleted) return;
    
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
    
    setIsRunning(true);
  };

  const handleSessionComplete = () => {
    stopTimer();
    
    const updatedProgress: SessionProgress = {
      ...sessionProgress,
      completedRounds: sessionProgress.currentSession.type === 'work' 
        ? sessionProgress.completedRounds + 1 
        : sessionProgress.completedRounds,
    };

    const nextSession = getNextSession(sessionProgress.currentSession, sessionConfig);
    
    if (nextSession) {
      updatedProgress.currentSession = nextSession;
      setTimeLeft(nextSession.duration);
      setSessionProgress(updatedProgress);
      
      setTimeout(() => {
        onSessionComplete?.(updatedProgress);
      }, 0);
    } else {
      // All sessions completed - disable everything
      updatedProgress.isCompleted = true;
      setSessionProgress(updatedProgress);
      setTimeLeft(0);
      
      setTimeout(() => {
        onAllSessionsComplete?.();
      }, 0);
    }
  };

  // Stop timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  // Toggle play/pause
  const toggleTimer = () => {
    if (sessionProgress.isCompleted || isTaskCompleted) return;
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const resetTimer = () => {
    if (sessionProgress.isCompleted || isTaskCompleted) return;
    stopTimer();
    setTimeLeft(sessionProgress.currentSession.duration);
  };

  // Skip current session
  const skipSession = () => {
    if (sessionProgress.isCompleted || isTaskCompleted) return;
    handleSessionComplete();
  };

  // Handle complete task button press
  const handleCompleteTask = () => {
    if (sessionProgress.isCompleted || isTaskCompleted) return;

    Alert.alert(
      "Complete Task",
      "Are you sure you want to mark this task as completed?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, Complete",
          onPress: () => {
            setIsTaskCompleted(true);
            stopTimer();
            setTimeLeft(0);
            setSessionProgress(prev => ({
              ...prev,
              isCompleted: true
            }));
            
            setTimeout(() => {
              onAllSessionsComplete?.();
            }, 0);
          }
        }
      ]
    );
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Disabled state: either all sessions are completed OR task is manually completed
  const isDisabled = sessionProgress.isCompleted || isTaskCompleted;
  const controlColor = isDisabled ? '#A5A5A5' : '#816ACE';
  const playPauseBgColor = isDisabled ? '#A5A5A5' : '#816ACE';
  const completeTaskBgColor = isDisabled ? '#A5A5A5' : '#816ACE';

  return (
    <View style={styles.container}>
      <View style={[styles.circleWrapper, { width: size, height: size}]}>
        <Svg width={size + 50} height={size + 50}>
          <G rotation="-90" origin={`${(size + 50)/ 2}, ${(size + 50)/ 2}`}>
            {/* Background Circle */}
            <Circle
              cx={(size + 50)/ 2}
              cy={(size + 50)/ 2}
              r={radius}
              stroke="#D5CBF8"
              strokeWidth={10}
              fill="transparent"
              opacity={1.0}
            />
            {/* Progress Circle */}
            <Circle
              cx={(size + 50)/ 2}
              cy={(size + 50)/ 2}
              r={radius}
              stroke={isDisabled ? '#A5A5A5' : color}
              strokeWidth={10}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        {/* Timer Text */}
        <View style={[styles.textContainer]}>
          <Text style={[styles.timerText]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Control Buttons - Disabled when completed */}
      <View style={styles.controls}>
        {/* Reset Button - Left */}
        <Ionicons 
          name="refresh" 
          size={30} 
          color={controlColor} 
          onPress={resetTimer}
          style={[styles.sideButton, isDisabled && styles.disabledButton]}
        />
        
        {/* Play/Pause Button - Middle (Circle) */}
        <View style={[styles.playPauseContainer, { backgroundColor: playPauseBgColor }]}>
          <Ionicons 
            name={isRunning ? "pause" : "play"}
            size={30} 
            color="#FFFFFF" 
            onPress={toggleTimer}
            style={isRunning ? null : styles.playIconOffset}
          />
        </View>
        
        {/* Skip Button - Right */}
        <Ionicons 
          name="play-skip-forward" 
          size={30} 
          color={controlColor} 
          onPress={skipSession}
          style={[styles.sideButton, isDisabled && styles.disabledButton]}
        />
      </View>

      <View style={[styles.completeTaskContainer, { backgroundColor: completeTaskBgColor }]}>
        <Text 
          style={styles.completeTask}
          onPress={handleCompleteTask}
        >
          {isDisabled ? 'Task Completed' : 'Complete Task'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  timerText: {
    fontSize: responsiveFontSize(38),
    fontFamily: 'Rubik-Regular',
    textAlign: 'center',
    includeFontPadding: false,
    color: '#816ACE'
  },
  controls: {
    flexDirection: 'row',
    gap: 24,
    marginTop: responsiveHeight(5),
  },
  controlButton: {
    fontSize: 24,
    padding: 10,
  },
  sideButton: {
    padding: 10,
  },
  playPauseContainer: {
    width: 50,
    height: 50,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 2,
  },
  disabledButton: {
    opacity: 1.0,
  },
  completeTaskContainer: {
    alignSelf: 'center',
    backgroundColor: '#816ACE',
    paddingHorizontal: responsiveWidth(8),
    paddingVertical: responsiveHeight(1),
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: responsiveHeight(3),
  },
  completeTask: {
    color: '#FFFFFF',
    alignSelf: 'center',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    fontFamily: 'Rubik-Regular',
  },
});

export default CountdownCircle;