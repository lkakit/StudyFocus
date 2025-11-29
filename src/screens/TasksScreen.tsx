import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WorkflowType, SessionConfig } from '../types/session.types';

const { width, height } = Dimensions.get('window');

const responsiveHeight = (percentage: number) => height * (percentage / 100);
const responsiveFontSize = (baseSize: number) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(baseSize * scale);
};

interface Workflow {
  type: WorkflowType;
  name: string;
  description: string;
  icon: string;
  color: string;
  studyMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
}

const TimerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [rounds, setRounds] = useState<number>(4);
  const [showRoundsDropdown, setShowRoundsDropdown] = useState(false);

  // custom-only state
  const [customStudy, setCustomStudy] = useState('25');
  const [customBreak, setCustomBreak] = useState('5');

  const workflows: Workflow[] = [
    {
      type: 'pomodoro',
      name: 'Pomodoro',
      description:
        '25 minutes of focused work, followed by a 5-minute break. 4 rounds then a long break.',
      icon: '🍅',
      color: '#9C6BA3',
      studyMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 20,
      longBreakEvery: 4,
    },
    {
      type: 'university',
      name: 'University Focus',
      description:
        'A balanced 50-minute study session with a 10-minute break to review notes.',
      icon: '🎓',
      color: '#9C6BA3',
      studyMinutes: 50,
      breakMinutes: 10,
      longBreakMinutes: 20,
      longBreakEvery: 3,
    },
    {
      type: '52-17',
      name: '52/17',
      description:
        'Work with high intensity for 52 minutes, then take a full 17-minute break to recharge.',
      icon: '⏱️',
      color: '#9C6BA3',
      studyMinutes: 52,
      breakMinutes: 17,
      longBreakMinutes: 0,
      longBreakEvery: 999,
    },
    {
      type: 'custom',
      name: 'Custom',
      description:
        'Customize your own study and break times, and set the number of rounds.',
      icon: '⚙️',
      color: '#9C6BA3',
      studyMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 20,
      longBreakEvery: 4,
    },
  ];

  const handleNewTaskPress = () => {
    setShowWorkflowModal(true);
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setRounds(4);
    if (workflow.type === 'custom') {
      setCustomStudy(String(workflow.studyMinutes));
      setCustomBreak(String(workflow.breakMinutes));
    }
    setShowWorkflowModal(false);
    setShowTaskModal(true);
    setShowRoundsDropdown(false);
  };

  // effective minutes (use custom values if custom workflow)
  const effectiveStudy =
    selectedWorkflow?.type === 'custom'
      ? Number(customStudy) || 0
      : selectedWorkflow?.studyMinutes || 0;

  const effectiveBreak =
    selectedWorkflow?.type === 'custom'
      ? Number(customBreak) || 0
      : selectedWorkflow?.breakMinutes || 0;

  const totalTimeMinutes =
    selectedWorkflow == null
      ? 0
      : (effectiveStudy + effectiveBreak) * rounds +
        Math.floor(rounds / selectedWorkflow.longBreakEvery) *
          selectedWorkflow.longBreakMinutes;

  const totalHours = Math.floor(totalTimeMinutes / 60);
  const totalMins = totalTimeMinutes % 60;

  const handleStartSession = () => {
    if (!taskInput.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!selectedWorkflow) {
      Alert.alert('Error', 'Please select a workflow');
      return;
    }

    // Convert minutes → seconds
    const workMinutes =
      selectedWorkflow.type === 'custom'
        ? Number(customStudy) || 0
        : selectedWorkflow.studyMinutes;

    const breakMinutes =
      selectedWorkflow.type === 'custom'
        ? Number(customBreak) || 0
        : selectedWorkflow.breakMinutes;

    const sessionConfig: SessionConfig = {
      taskTitle: taskInput.trim(),
      workTime: workMinutes * 60,
      breakTime: breakMinutes * 60,
      longBreakTime: selectedWorkflow.longBreakMinutes * 60,
      rounds,
      roundsUntilLongBreak: selectedWorkflow.longBreakEvery,
      workflowType: selectedWorkflow.type,
    };

    // Navigate to Timer tab with config
    navigation.navigate('Timer', { sessionConfig });

    // Reset local UI state
    setTaskInput('');
    setSelectedWorkflow(null);
    setShowTaskModal(false);
    setShowRoundsDropdown(false);
  };

  const handleCancelTask = () => {
    setTaskInput('');
    setSelectedWorkflow(null);
    setShowTaskModal(false);
    setShowRoundsDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Svg
        width={width}
        height={height}
        preserveAspectRatio="xMinYMin slice"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <LinearGradient id="grad45" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F2BAE7" />
            <Stop offset="40%" stopColor="#F3E0F5" />
            <Stop offset="100%" stopColor="#AE91E1" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#grad45)" />
      </Svg>

      {/* Header */}
      <Text style={styles.headerTitle}>Focus Timer</Text>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.workflowTitle}>Select a Workflow</Text>

        {workflows.map(workflow => (
          <TouchableOpacity
            key={workflow.type}
            style={styles.workflowCard}
            onPress={() => handleWorkflowSelect(workflow)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.emojiIcon}>{workflow.icon}</Text>
              <View style={styles.textContainer}>
                <Text style={styles.workflowName}>{workflow.name}</Text>
                <Text style={styles.workflowDescription}>{workflow.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workflow Selection Modal (optional trigger via handleNewTaskPress) */}
      <Modal
        visible={showWorkflowModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWorkflowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWorkflowModal(false)}
            >
              <Ionicons name="close" size={24} color="#555555" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Select Workflow</Text>

            {workflows.map(workflow => (
              <TouchableOpacity
                key={workflow.type}
                style={styles.workflowOption}
                onPress={() => handleWorkflowSelect(workflow)}
              >
                <Text style={styles.emojiIcon}>{workflow.icon}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionName}>{workflow.name}</Text>
                  <Text style={styles.optionDescription}>{workflow.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Config / Task Modal */}
      <Modal
        visible={showTaskModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelTask}
      >
        <View style={styles.centerOverlay}>
          <View style={styles.taskModalContent}>
            <View style={styles.configHeader}>
              <Text style={styles.configTitle}>{selectedWorkflow?.name}</Text>
            </View>

            <View style={styles.configBody}>
              {/* Task name */}
              <Text style={styles.fieldLabel}>Task Name</Text>
              <TextInput
                style={styles.taskInput}
                placeholder="Task Name"
                placeholderTextColor="#8B6CCF"
                value={taskInput}
                onChangeText={setTaskInput}
              />

              {selectedWorkflow && (
                <>
                  {/* Study time */}
                  {selectedWorkflow.type === 'custom' ? (
                    <View style={styles.row}>
                      <Text style={styles.fieldLabel}>Study Time:</Text>
                      <TextInput
                        style={styles.smallNumberInput}
                        keyboardType="numeric"
                        value={customStudy}
                        onChangeText={text =>
                          setCustomStudy(text.replace(/[^0-9]/g, ''))
                        }
                        placeholder="mins"
                        placeholderTextColor="#8B6CCF"
                      />
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <Text style={styles.fieldLabel}>Study Time:</Text>
                      <Text style={styles.fieldValue}>
                        {selectedWorkflow.studyMinutes} mins
                      </Text>
                    </View>
                  )}

                  {/* Break time */}
                  {selectedWorkflow.type === 'custom' ? (
                    <View style={styles.row}>
                      <Text style={styles.fieldLabel}>Break Time:</Text>
                      <TextInput
                        style={styles.smallNumberInput}
                        keyboardType="numeric"
                        value={customBreak}
                        onChangeText={text =>
                          setCustomBreak(text.replace(/[^0-9]/g, ''))
                        }
                        placeholder="mins"
                        placeholderTextColor="#8B6CCF"
                      />
                    </View>
                  ) : (
                    <View style={styles.row}>
                      <Text style={styles.fieldLabel}>Break Time:</Text>
                      <Text style={styles.fieldValue}>
                        {selectedWorkflow.breakMinutes} mins
                      </Text>
                    </View>
                  )}

                  {/* Long break (read-only for now) */}
                  <View style={styles.row}>
                    <Text style={styles.fieldLabel}>Long Break:</Text>
                    <Text style={styles.fieldValue}>
                      {selectedWorkflow.longBreakMinutes} mins (every{' '}
                      {selectedWorkflow.longBreakEvery} rounds)
                    </Text>
                  </View>

                  {/* Rounds dropdown */}
                  <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                    Number of Rounds
                  </Text>

                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowRoundsDropdown(prev => !prev)}
                  >
                    <Text style={styles.dropdownButtonText}>{rounds}</Text>
                    <Ionicons
                      name={showRoundsDropdown ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#4B368C"
                    />
                  </TouchableOpacity>

                  {showRoundsDropdown && (
                    <View style={styles.dropdownList}>
                      <ScrollView nestedScrollEnabled={true}>
                        {Array.from({ length: 11 }).map((_, index) => {
                          const value = index;
                          const isSelected = value === rounds;
                          return (
                            <TouchableOpacity
                              key={value}
                              style={[
                                styles.dropdownItem,
                                isSelected && styles.dropdownItemSelected,
                              ]}
                              onPress={() => {
                                setRounds(value);
                                setShowRoundsDropdown(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  isSelected && styles.dropdownItemTextSelected,
                                ]}
                              >
                                {value}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  <View style={[styles.row, { marginTop: 8 }]}>
                    <Text style={styles.fieldLabel}>Total Time:</Text>
                    <Text style={styles.fieldValue}>
                      {totalHours > 0 ? `${totalHours}h ` : ''}
                      {totalMins}m
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelTask}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.startButton]}
                onPress={handleStartSession}
              >
                <Text style={styles.startButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: responsiveFontSize(26),
    color: '#816ACE',
    zIndex: 1,
    fontFamily: 'Rubik-Regular',
  },
  scrollView: {
    flex: 1,
    marginTop: responsiveHeight(12),
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: responsiveHeight(12),
  },
  workflowTitle: {
    fontSize: responsiveFontSize(20),
    color: '#816ACE',
    fontFamily: 'Rubik-Medium',
    marginBottom: 20,
    textAlign: 'center',
  },
  workflowCard: {
    backgroundColor: '#9C6BA3',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  emojiIcon: {
    fontSize: responsiveFontSize(32),
    marginTop: 2,
  },
  workflowName: {
    fontSize: responsiveFontSize(18),
    fontFamily: 'Rubik-Medium',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#EADAFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  taskModalContent: {
    backgroundColor: '#EADAFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  modalTitle: {
    fontSize: responsiveFontSize(22),
    fontFamily: 'Rubik-Medium',
    color: '#555555',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  workflowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionName: {
    fontSize: responsiveFontSize(16),
    fontFamily: 'Rubik-Medium',
    color: '#555555',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: responsiveFontSize(12),
    fontFamily: 'Rubik-Regular',
    color: '#999',
  },

  centerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configHeader: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FDF9FF',
  },
  configTitle: {
    fontSize: responsiveFontSize(18),
    fontFamily: 'Rubik-Medium',
    color: '#4B368C',
  },
  configBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  fieldLabel: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Medium',
    color: '#4B368C',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Regular',
    color: '#4B368C',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskInput: {
    borderWidth: 2,
    borderColor: '#8B6CCF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: responsiveFontSize(16),
    fontFamily: 'Rubik-Regular',
    color: '#4B368C',
    marginBottom: 16,
    backgroundColor: '#FDF9FF',
  },
  smallNumberInput: {
    minWidth: 70,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8B6CCF',
    borderRadius: 8,
    textAlign: 'right',
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Regular',
    color: '#4B368C',
    backgroundColor: '#FDF9FF',
  },

  dropdownButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D2C3F4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDF9FF',
  },
  dropdownButtonText: {
    fontSize: responsiveFontSize(14),
    color: '#4B368C',
    fontFamily: 'Rubik-Regular',
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#D2C3F4',
    borderRadius: 10,
    backgroundColor: '#FDF9FF',
    maxHeight: 220,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#8B6CCF',
  },
  dropdownItemText: {
    fontSize: responsiveFontSize(14),
    color: '#4B368C',
    fontFamily: 'Rubik-Regular',
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Rubik-Medium',
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#EADAFF',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#816ACE',
  },
  cancelButtonText: {
    color: '#816ACE',
    fontFamily: 'Rubik-Medium',
    fontSize: responsiveFontSize(14),
  },
  startButton: {
    backgroundColor: '#816ACE',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Rubik-Medium',
    fontSize: responsiveFontSize(14),
  },
});

export default TimerScreen;
