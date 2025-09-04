import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const VoiceConfigPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedAccent, setSelectedAccent] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAccentModal, setShowAccentModal] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const router = useRouter();

  const languages = [
    { label: 'English', value: 'english' },
    
    
  ];

  const accents = [
    { label: 'US English', value: 'us_english' },
    { label: 'Arabic English', value: 'arabian_english' },
    { label: 'Indian English', value: 'indian_english' },
    { label: 'Australian English', value: 'australian_english' },
    { label: 'Indian Hindi', value: 'indian_hindi' },
    
  ];

  const useCases = [
    {
      id: 1,
      title: 'Real Estate',
      tag: 'Real Estate',
      tagColor: '#00D4AA',
      language: 'En',
      description: 'An AI-powered real estate assistant to capture leads, schedule site visits, answer property queries, and guide buyers 24/7',
      duration: '0:00 / 0:00',
      isPlaying: false,
    },
    {
      id: 2,
      title: 'Alex HR',
      tag: 'HR Executive',
      tagColor: '#FF9500',
      language: 'En',
      description: 'A smart HR assistant to streamline recruitment, schedule interviews, answer employee queries, and manage HR tasks effortlessly.',
      duration: '0:00 / 0:01',
      isPlaying: false,
    },
    {
      id: 3,
      title: 'Hospital Booking',
      tag: 'Hospital',
      tagColor: '#00D4AA',
      language: 'En',
      description: 'An intelligent AI assistant to book doctor appointments, provide department info, and answer patient queries 24/7',
      duration: '0:00 / 0:00',
      isPlaying: false,
    },
    {
      id: 4,
      title: 'Restaurants Booking',
      tag: 'Restaurant',
      tagColor: '#00D4AA',
      language: 'En',
      description: 'An AI-powered assistant to handle reservations, menus and book your table in seconds, Order food online seamlessly with our smart AI table reservation bot 24/7',
      duration: '0:00 / 0:00',
      isPlaying: false,
    },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.label);
    setShowLanguageModal(false);
  };

  const handleAccentSelect = (accent) => {
    setSelectedAccent(accent.label);
    setShowAccentModal(false);
  };

  const handleUseCaseSelect = (useCaseId) => {
    setSelectedUseCase(useCaseId);
  };

  const handlePlayAudio = (useCaseId) => {
    if (playingAudio === useCaseId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(useCaseId);
      // Simulate audio playback - in real app, you'd integrate with audio library
      setTimeout(() => {
        setPlayingAudio(null);
      }, 2000);
    }
  };

  const renderDropdownModal = (
    title,
    selectedValue,
    placeholder,
    options,
    showModal,
    setShowModal,
    onSelect
  ) => {
    return (
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>{title}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={[styles.dropdownButtonText, !selectedValue && styles.placeholder]}>
            {selectedValue || placeholder}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalItem,
                      selectedValue === option.label && styles.selectedModalItem
                    ]}
                    onPress={() => onSelect(option)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      selectedValue === option.label && styles.selectedModalItemText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const renderUseCaseCard = (useCase) => {
    const isSelected = selectedUseCase === useCase.id;
    const isPlaying = playingAudio === useCase.id;

    return (
      <TouchableOpacity
        key={useCase.id}
        style={[
          styles.useCaseCard,
          isSelected && styles.selectedUseCaseCard
        ]}
        onPress={() => handleUseCaseSelect(useCase.id)}
      >
        <View style={styles.useCaseHeader}>
          <View style={styles.useCaseTitle}>
            <Text style={styles.useCaseTitleText}>{useCase.title}</Text>
            <View style={[styles.useCaseTag, { backgroundColor: useCase.tagColor }]}>
              <Text style={styles.useCaseTagText}>{useCase.tag}</Text>
            </View>
          </View>
          <View style={styles.languageIndicator}>
            <Text style={styles.languageText}>{useCase.language}</Text>
          </View>
        </View>
        
        <Text style={styles.useCaseDescription}>{useCase.description}</Text>
        
        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayAudio(useCase.id)}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.audioTimeline}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: isPlaying ? '20%' : '0%' }
              ]} />
            </View>
            <Text style={styles.durationText}>{useCase.duration}</Text>
          </View>
          
          <TouchableOpacity style={styles.volumeButton}>
            <Text style={styles.volumeButtonText}>🔊</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.backgroundGradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Voice Configuration</Text>
            <Text style={styles.pageSubtitle}>
              Configure your AI agent's voice and select use cases
            </Text>
          </View>

          <View style={[styles.dropdownSection, { marginTop: 10 }]}>
            <View style={styles.dropdownRow}>
              {renderDropdownModal(
                'Select Language',
                selectedLanguage,
                'Select Language',
                languages,
                showLanguageModal,
                setShowLanguageModal,
                handleLanguageSelect
              )}
              
              {renderDropdownModal(
                'Select Accent',
                selectedAccent,
                'Select Accent',
                accents,
                showAccentModal,
                setShowAccentModal,
                handleAccentSelect
              )}
            </View>
          </View>

          <View style={styles.useCasesSection}>
            <Text style={styles.useCasesTitle}>Use Cases*</Text>
            <View style={styles.useCasesGrid}>
              {useCases.map(useCase => renderUseCaseCard(useCase))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.nextButton, !selectedUseCase && styles.nextButtonDisabled]} 
            onPress={() => router.push({ 
              pathname: '/HireNow1', 
              params: { 
                useCase: selectedUseCase,
                selectedLanguage: selectedLanguage,
                selectedAccent: selectedAccent
              } 
            })}
            disabled={!selectedUseCase}
          >
            <Text style={[styles.nextButtonText, !selectedUseCase && styles.nextButtonTextDisabled]}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 15, // Reduced from 20 to 15 to match Dashboard.js
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15, // Reduced from commented 30 to 15 to match Dashboard.js
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  dropdownSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 15,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  placeholder: {
    color: '#999999',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedModalItem: {
    backgroundColor: '#E3F2FD',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedModalItemText: {
    color: '#FF9500',
    fontWeight: '600',
  },
  useCasesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  useCasesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  useCasesGrid: {
    gap: 15,
  },
  useCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedUseCaseCard: {
    borderColor: '#FF9500',
    borderWidth: 2,
    shadowColor: '#FF9500',
    shadowOpacity: 0.2,
  },
  useCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  useCaseTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  useCaseTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  useCaseTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  useCaseTagText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  languageIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  useCaseDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 12,
  },
  audioTimeline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
  },
  durationText: {
    fontSize: 12,
    color: '#666666',
    minWidth: 60,
  },
  volumeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeButtonText: {
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
});

export default VoiceConfigPage;