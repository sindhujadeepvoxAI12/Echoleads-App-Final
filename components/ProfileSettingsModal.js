// components/ProfileSettingsModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import {
  X,
  Edit,
  Lock,
  Mail,
  LogOut,
  User,
  Bell,
  Settings,
  Shield,
  Phone,
  Globe,
  Camera,
  ChevronRight,
  Save,
  Eye,
  EyeOff
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ProfileSettingsModal = ({ visible, onClose, userName, setUserName }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  
  // Form States
  const [tempUserName, setTempUserName] = useState(userName);
  const [email, setEmail] = useState('john.smith@company.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [role, setRole] = useState('Administrator');
  const [department, setDepartment] = useState('Sales Operations');
  
  // Settings States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  
  // Security States
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Active Tab State
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'notifications', 'security'

  useEffect(() => {
    if (visible) {
      setTempUserName(userName);
      setActiveTab('profile');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, userName]);

  const handleSave = () => {
    if (activeTab === 'profile') {
      setUserName(tempUserName);
      Alert.alert('Success', 'Profile updated successfully!');
    } else if (activeTab === 'security') {
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match!');
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long!');
        return;
      }
      Alert.alert('Success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Success', 'Notification settings updated successfully!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You'll need to sign in again to access your account.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            onClose();
            Alert.alert("Logged Out", "You have been successfully logged out.");
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Account Deleted", "Your account has been successfully deleted.");
            onClose();
          }
        }
      ]
    );
  };

  const TabButton = ({ id, title, icon: Icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon size={16} color={isActive ? '#FF9500' : '#666'} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.largeAvatar}>
          <User size={30} color="#FFFFFF" />
        </View>
        <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.7}>
          <Camera size={14} color="#FF9500" />
        </TouchableOpacity>
        <Text style={styles.avatarName}>{tempUserName}</Text>
        <Text style={styles.avatarRole}>{role}</Text>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.formInput}
            value={tempUserName}
            onChangeText={setTempUserName}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Email Address</Text>
          <TextInput
            style={styles.formInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Phone Number</Text>
          <TextInput
            style={styles.formInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Department</Text>
          <TextInput
            style={styles.formInput}
            value={department}
            onChangeText={setDepartment}
            placeholder="Enter your department"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Role</Text>
          <View style={styles.roleDisplay}>
            <Text style={styles.roleText}>{role}</Text>
            <Shield size={16} color="#666" />
          </View>
        </View>
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Notification Preferences</Text>
      
      <View style={styles.settingsGroup}>
        <Text style={styles.settingsGroupTitle}>General Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={18} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications on your device</Text>
            </View>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#E5E5E5', true: '#FF950080' }}
            thumbColor={pushNotifications ? '#FF9500' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Mail size={18} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via email</Text>
            </View>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E5E5E5', true: '#FF950080' }}
            thumbColor={emailNotifications ? '#FF9500' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Phone size={18} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Call Notifications</Text>
              <Text style={styles.settingDescription}>Notifications for incoming calls</Text>
            </View>
          </View>
          <Switch
            value={callNotifications}
            onValueChange={setCallNotifications}
            trackColor={{ false: '#E5E5E5', true: '#FF950080' }}
            thumbColor={callNotifications ? '#FF9500' : '#FFFFFF'}
          />
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <Text style={styles.settingsGroupTitle}>Reports & Analytics</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Globe size={18} color="#666" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Weekly Reports</Text>
              <Text style={styles.settingDescription}>Receive weekly performance reports</Text>
            </View>
          </View>
          <Switch
            value={weeklyReports}
            onValueChange={setWeeklyReports}
            trackColor={{ false: '#E5E5E5', true: '#FF950080' }}
            thumbColor={weeklyReports ? '#FF9500' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Security & Privacy</Text>
      
      {/* Password Change Section */}
      <View style={styles.formSection}>
        <Text style={styles.settingsGroupTitle}>Change Password</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <EyeOff size={16} color="#666" /> : 
                <Eye size={16} color="#666" />
              }
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>New Password</Text>
          <TextInput
            style={styles.formInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={true}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.formInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={true}
          />
        </View>
      </View>

      {/* Security Options */}
      <View style={styles.settingsGroup}>
        <Text style={styles.settingsGroupTitle}>Privacy Options</Text>
        
        <TouchableOpacity style={styles.securityOption} activeOpacity={0.7}>
          <Lock size={18} color="#666" />
          <Text style={styles.securityOptionText}>Two-Factor Authentication</Text>
          <ChevronRight size={16} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityOption} activeOpacity={0.7}>
          <Shield size={18} color="#666" />
          <Text style={styles.securityOptionText}>Privacy Settings</Text>
          <ChevronRight size={16} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.securityOption} activeOpacity={0.7}>
          <Globe size={18} color="#666" />
          <Text style={styles.securityOptionText}>Data & Privacy</Text>
          <ChevronRight size={16} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.fullScreenContainer}>
        <Animated.View 
          style={[
            styles.modal,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <View style={styles.iconContainer}>
                <Settings size={20} color="#FF9500" />
              </View>
              <Text style={styles.title}>Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TabButton
              id="profile"
              title="Profile"
              icon={User}
              isActive={activeTab === 'profile'}
              onPress={() => setActiveTab('profile')}
            />
            <TabButton
              id="notifications"
              title="Notifications"
              icon={Bell}
              isActive={activeTab === 'notifications'}
              onPress={() => setActiveTab('notifications')}
            />
            <TabButton
              id="security"
              title="Security"
              icon={Lock}
              isActive={activeTab === 'security'}
              onPress={() => setActiveTab('security')}
            />
          </View>

          {/* Tab Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={16} color="#FF3B30" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF9500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContent: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 35,
    right: '35%',
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarRole: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  roleDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  roleText: {
    fontSize: 16,
    color: '#666666',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  settingsGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  securityOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  dangerZone: {
    marginTop: 30,
    padding: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.1)',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSettingsModal;