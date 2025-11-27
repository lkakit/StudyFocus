import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

const {width, height} = Dimensions.get('window');

const responsiveHeight = (percentage: number) => height * (percentage / 100);
const responsiveWidth = (percentage: number) => width * (percentage / 100);
const responsiveFontSize = (baseSize: number) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(baseSize * scale);
};
const TimerScreen: React.FC = () => {
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


      <Text style={styles.headerTitle}>Focus Timer</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default TimerScreen;