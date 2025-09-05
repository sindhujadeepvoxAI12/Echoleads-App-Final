// Purchase screen temporarily disabled
/*
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Phone } from 'lucide-react-native';

const PurchasePage = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [additionalCredits, setAdditionalCredits] = useState(0);
  const [phonePurchaseData, setPhonePurchaseData] = useState(null);
  const [isPhonePurchase, setIsPhonePurchase] = useState(false);

  const basePrice = 15000;
  const creditPrice = 20;
  const annualDiscount = 0.1667; // 16.67%

  // Check for phone purchase data
  useEffect(() => {
    const checkPhonePurchase = async () => {
      try {
        const purchaseData = await AsyncStorage.getItem('PURCHASE_PHONE_NUMBERS');
        if (purchaseData) {
          const data = JSON.parse(purchaseData);
          setPhonePurchaseData(data);
          setIsPhonePurchase(true);
        }
      } catch (error) {
        console.log('Error checking phone purchase data:', error);
      }
    };

    checkPhonePurchase();
  }, []);

  const getMonthlyPrice = () => {
    if (isAnnual) {
      return Math.round(basePrice * (1 - annualDiscount));
    }
    return basePrice;
  };

  const getTotalPrice = () => {
    const subscriptionPrice = getMonthlyPrice();
    const creditsPrice = additionalCredits * creditPrice;
    return subscriptionPrice + creditsPrice;
  };

  const handleCreditChange = (increment) => {
    if (increment) {
      setAdditionalCredits(prev => prev + 1);
    } else {
      setAdditionalCredits(prev => Math.max(0, prev - 1));
    }
  };

  const handlePhonePurchaseComplete = async () => {
    if (!phonePurchaseData) return;

    try {
      // Get existing phone numbers
      const existingNumbers = await AsyncStorage.getItem('PHONE_NUMBERS_DATA');
      let phoneNumbers = existingNumbers ? JSON.parse(existingNumbers) : [];

      // Add new phone numbers with unique IDs
      const newNumbers = phonePurchaseData.phoneNumbers.map((number, index) => ({
        id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        number,
        agentId: null
      }));

      const updatedNumbers = [...phoneNumbers, ...newNumbers];
      await AsyncStorage.setItem('PHONE_NUMBERS_DATA', JSON.stringify(updatedNumbers));

      // Clear purchase data
      await AsyncStorage.removeItem('PURCHASE_PHONE_NUMBERS');

      Alert.alert(
        'Success!',
        `Successfully purchased ${phonePurchaseData.phoneNumbers.length} phone number(s)`,
        [
          {
            text: 'OK',
                         onPress: () => {
               setPhonePurchaseData(null);
               setIsPhonePurchase(false);
               router.push('/(tabs)/PhoneSettings');
             }
          }
        ]
      );
    } catch (error) {
      console.log('Error completing phone purchase:', error);
      Alert.alert('Error', 'Failed to complete purchase');
    }
  };

  const planFeatures = [
    '10 monthly credits',
    'Basic analytics',
    'Email support',
    'Single agent',
    '30-day data retention'
  ];

  const renderHeader = () => {
    if (isPhonePurchase) {
      return (
        <View style={styles.headerContainer}>
          <Phone size={32} color="#FF9500" style={{ marginBottom: 10 }} />
          <Text style={styles.headerTitle}>Phone Numbers Purchase</Text>
          <Text style={styles.headerSubtitle}>
            Complete your purchase to get {phonePurchaseData?.phoneNumbers?.length || 0} phone number(s)
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Choose Your Subscription Plan</Text>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, !isAnnual && styles.activeToggleText]}>
            Monthly
          </Text>
          <Switch
            value={isAnnual}
            onValueChange={setIsAnnual}
            trackColor={{ false: '#E0E0E0', true: '#FF9500' }}
            thumbColor={isAnnual ? '#FFFFFF' : '#FFFFFF'}
            style={styles.switch}
          />
          <Text style={[styles.toggleText, isAnnual && styles.activeToggleText]}>
            Annually
          </Text>
          
          {isAnnual && (
            <View style={styles.savingsBadge}>
              <Text style={styles.freeMonthsText}>2 month free</Text>
              <Text style={styles.savingsText}>Save 16.67%</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderPlanCard = () => {
    return (
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Standard</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>INR</Text>
          <Text style={styles.price}>{getMonthlyPrice().toLocaleString()}</Text>
          <Text style={styles.period}>/month</Text>
        </View>

        <View style={styles.featuresContainer}>
          {planFeatures.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAdditionalCredits = () => {
    return (
      <View style={styles.creditsContainer}>
        <Text style={styles.creditsTitle}>Additional Credits</Text>
        <Text style={styles.creditsSubtitle}>
          Add extra credits (INR 20 per credit per minute )
        </Text>
        
        <View style={styles.creditsSelector}>
          <TouchableOpacity
            style={styles.creditButton}
            onPress={() => handleCreditChange(false)}
          >
            <Text style={styles.creditButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.creditCount}>{additionalCredits}</Text>
          
          <TouchableOpacity
            style={styles.creditButton}
            onPress={() => handleCreditChange(true)}
          >
            <Text style={styles.creditButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.additionalCostContainer}>
          <Text style={styles.additionalCostLabel}>Additional cost:</Text>
          <Text style={styles.additionalCostValue}>
            {(additionalCredits * creditPrice).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (isPhonePurchase) {
      return (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Phone Numbers Summary</Text>
          
          <View style={styles.phoneNumbersList}>
            {phonePurchaseData?.phoneNumbers?.map((number, index) => (
              <View key={index} style={styles.phoneNumberRow}>
                <Phone size={16} color="#FF9500" />
                <Text style={styles.phoneNumberText}>{number}</Text>
                <Text style={styles.phoneNumberPrice}>${phonePurchaseData?.totalPrice ? (phonePurchaseData.totalPrice / phonePurchaseData.phoneNumbers.length).toFixed(2) : '25.00'}</Text>
              </View>
            ))}
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${phonePurchaseData?.totalPrice?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subscription ({isAnnual ? 'annual' : 'monthly'}):
          </Text>
          <Text style={styles.summaryValue}>{getMonthlyPrice().toLocaleString()}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Additional Credits ({additionalCredits}):
          </Text>
          <Text style={styles.summaryValue}>
            {(additionalCredits * creditPrice).toLocaleString()}
          </Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total (INR):</Text>
          <Text style={styles.totalValue}>{getTotalPrice().toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (isPhonePurchase) {
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
                         onPress={() => {
               AsyncStorage.removeItem('PURCHASE_PHONE_NUMBERS');
               setPhonePurchaseData(null);
               setIsPhonePurchase(false);
               router.push('/(tabs)/PhoneSettings');
             }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={handlePhonePurchaseComplete}
          >
            <Text style={styles.subscribeButtonText}>Complete Purchase</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Start Subscription</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
              <LinearGradient
          colors={['#F8F9FA', '#F8F9FA']}
          style={styles.backgroundGradient}
        >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderHeader()}
          
          <View style={{ marginTop: 10 }}>
            {!isPhonePurchase && (
              <>
                {renderPlanCard()}
                {renderAdditionalCredits()}
              </>
            )}
            {renderOrderSummary()}
            {renderActionButtons()}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15, // Moderate padding top
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15, // Moderate padding top
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 25,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingRight: 80, // Add padding to accommodate the savings badge
  },
  toggleText: {
    fontSize: 16,
    color: '#666666',
    marginHorizontal: 15,
  },
  activeToggleText: {
    color: '#333333',
    fontWeight: '600',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  savingsBadge: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  freeMonthsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 30,
  },
  currency: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9500',
    marginHorizontal: 4,
  },
  period: {
    fontSize: 16,
    color: '#666666',
  },
  featuresContainer: {
    paddingLeft: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9500',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
  },
  creditsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 8,
  },
  creditsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  creditsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  creditButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  creditCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9500',
    marginHorizontal: 30,
    minWidth: 30,
    textAlign: 'center',
  },
  additionalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalCostLabel: {
    fontSize: 16,
    color: '#666666',
  },
  additionalCostValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  subscribeButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  phoneNumbersList: {
    marginBottom: 20,
  },
  phoneNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  phoneNumberText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 12,
  },
  phoneNumberPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
});

export default PurchasePage;
*/

// Placeholder component for disabled Purchase screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PurchasePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Purchase screen is temporarily disabled</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  text: {
    fontSize: 16,
    color: '#666666',
  },
});

export default PurchasePage;