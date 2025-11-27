import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HistoryItem, WorkflowType } from '../types/session.types';

const { width, height } = Dimensions.get('window');

const responsiveHeight = (percentage: number) => height * (percentage / 100);
const responsiveWidth = (percentage: number) => width * (percentage / 100);
const responsiveFontSize = (baseSize: number) => {
  const scale = Math.min(width, height) / 375;
  return Math.round(baseSize * scale);
};

// Add this interface for the props
interface HistoryScreenProps {
  historyItems: HistoryItem[];
  setHistoryItems: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ historyItems, setHistoryItems }) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const navigation = useNavigation<any>();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleItemPress = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleDeleteHistory = () => {
    if (selectedItem) {
      Alert.alert(
        'Delete History',
        'Are you sure you want to delete this session from history?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setHistoryItems(prev => prev.filter(item => item.id !== selectedItem.id));
              setIsModalVisible(false);
            },
          },
        ]
      );
    }
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{percentage}%</Text>
    </View>
  );

  const getWorkflowName = (workflowType: WorkflowType) => {
    const workflowNames = {
      pomodoro: 'Pomodoro',
      university: 'University Focus', 
      '52-17': '52/17 Method',
      custom: 'Custom'
    };
    return workflowNames[workflowType];
  };

  const handleReuseSession = () => {
    if (selectedItem) {
      setNewTaskName(selectedItem.taskName);
      setShowTaskPrompt(true);
      setIsModalVisible(false);
    }
  };

  const confirmReuseSession = () => {
    if (!selectedItem) return;
    if (newTaskName.trim()) {
    // Create a copy of the sessionConfig with updated taskTitle
    const updatedSessionConfig = {
      ...selectedItem.sessionConfig,
      taskTitle: newTaskName.trim()
    };
    
    navigation.navigate('Timer', {
      sessionConfig: updatedSessionConfig,
    });
    setShowTaskPrompt(false);
    } else {
      Alert.alert('Error', 'Please enter a task name');
    }
 }

  return (
    <View style={styles.container}>
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

      <Text style={styles.logo}>Focus Timer</Text>
      <Text style={styles.headerTitle}>History</Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          historyItems.length > 0 && styles.scrollContentWithItems
        ]}
      >
        {historyItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions completed yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your completed focus sessions will appear here
            </Text>
          </View>
        ) : (
          historyItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              onPress={() => handleItemPress(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.taskName}>{item.taskName}</Text>
                <Text style={styles.completionBadge}>
                  {item.completedRounds}/{item.totalRounds} rounds
                </Text>
              </View>
              
              <Text style={styles.dateTime}>
                {formatDate(item.date)} • {formatTime(item.date)} • {formatDuration(item.duration)}
              </Text>
              
              <ProgressBar percentage={item.completionPercentage} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {showTaskPrompt && (
        <Modal
          visible={showTaskPrompt}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.promptOverlay}>
            <View style={styles.promptContent}>
              <Text style={styles.promptTitle}>Task Name</Text>
              <TextInput
                style={styles.taskInput}
                value={newTaskName}
                onChangeText={setNewTaskName}
                placeholder="Enter task name"
                autoFocus={true}
              />
              <View style={styles.promptButtons}>
                <TouchableOpacity
                  style={[styles.promptButton, styles.cancelButton]}
                  onPress={() => setShowTaskPrompt(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.promptButton, styles.confirmButton]}
                  onPress={confirmReuseSession}
                >
                  <Text style={styles.confirmButtonText}>Start Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <TouchableOpacity
                  style={styles.closeButtonTop}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#555555" />
                </TouchableOpacity>

                <Text style={styles.modalTitle}>Session Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Task:</Text>
                  <Text style={styles.detailValue}>{selectedItem.taskName}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedItem.date)} • {formatTime(selectedItem.date)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{formatDuration(selectedItem.duration)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Progress:</Text>
                  <Text style={styles.detailValue}>
                    {selectedItem.completedRounds} of {selectedItem.totalRounds} rounds
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Workflow Type:</Text>
                  <Text style={styles.detailValue}>
                    {getWorkflowName(selectedItem.sessionConfig.workflowType)}
                  </Text>
                </View>
                
                <View>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.reuseButton]}
                    onPress={handleReuseSession}
                  >
                    <Text style={styles.reuseButtonText}>Reuse This Session</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteHistory}
                  >
                    <Text style={styles.deleteButtonText}>Delete from History</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  logo: {
    position: 'absolute',
    top: 60,
    left: 20,
    fontSize: 26,
    color: '#816ACE',
    zIndex: 1,
    fontFamily: 'Rubik-Regular',
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    color: '#816ACE',
    fontFamily: 'Rubik-Regular',
    alignSelf: 'center',
    marginTop: responsiveHeight(14),
  },
  scrollView: {
    flex: 1,
    marginTop: responsiveHeight(2),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scrollContentWithItems: {
    justifyContent: 'flex-start', 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: responsiveFontSize(20),
    color: '#6E6E6E',
    fontFamily: 'Rubik-Medium',
  },
  emptyStateSubtext: {
    fontSize: responsiveFontSize(14),
    color: '#6E6E6E',
    fontFamily: 'Rubik-Regular',
    opacity: 0.7,
  },
  historyCard: {
    backgroundColor: '#EBDAFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskName: {
    fontSize: responsiveFontSize(18),
    fontFamily: 'Rubik-Medium',
    color: '#6E6E6E',
    flex: 1,
    marginRight: 12,
  },
  completionBadge: {
    fontSize: responsiveFontSize(12),
    fontFamily: 'Rubik-Medium',
    color: '#816ACE',
    backgroundColor: '#D5CBF8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateTime: {
    fontSize: responsiveFontSize(12),
    fontFamily: 'Rubik-Regular',
    color: '#6E6E6E',
    opacity: 0.8,
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F3BFE9',
    borderRadius: 4,
  },
  progressText: {
    fontSize: responsiveFontSize(12),
    fontFamily: 'Rubik-Medium',
    color: '#6E6E6E',
    minWidth: 30,
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
  },
  closeButtonTop: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Medium',
    color: '#555555',
  },
  detailValue: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'Rubik-Regular',
    color: '#555555',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  reuseButton: {
    backgroundColor: '#816ACE',
  },
  reuseButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#816ACE',
  },
  deleteButtonText: {
    color: '#816ACE',
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
  },
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContent: {
    backgroundColor: '#ECE6F0',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  promptTitle: {
    fontSize: responsiveFontSize(20),
    fontFamily: 'Rubik-Medium',
    color: '#555555',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#816ACE',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promptButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#816ACE',
  },
  cancelButtonText: {
    color: '#816ACE',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#816ACE',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HistoryScreen;