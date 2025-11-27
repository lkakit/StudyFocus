import { Vibration, Alert } from 'react-native';

export const useAlarm = () => {
  const triggerAlarm = () => {
    // Vibrate pattern: vibrate for 1s, pause for 0.5s, repeat 3 times
    Vibration.vibrate([1000, 500, 1000, 500, 1000, 500]);

  };

  const stopAlarm = () => {
    Vibration.cancel();
  };

  return { triggerAlarm, stopAlarm };
};