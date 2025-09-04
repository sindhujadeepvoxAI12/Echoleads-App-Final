import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartBar as BarChart3 } from 'lucide-react-native';

const Chart = () => {
  const { theme } = useTheme();
  const animatedValue = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sample data for demonstration
  const data = [
    { day: '06/07', totalLeads: 5, successfulLeads: 2 },
    { day: '07/07', totalLeads: 8, successfulLeads: 4 },
    { day: '08/07', totalLeads: 6, successfulLeads: 3 },
    { day: '09/07', totalLeads: 10, successfulLeads: 7 },
    { day: '10/07', totalLeads: 4, successfulLeads: 2 },
    { day: '11/07', totalLeads: 9, successfulLeads: 6 },
    { day: '12/07', totalLeads: 7, successfulLeads: 4 },
  ];

  const maxValue = Math.max(...data.flatMap(d => [d.totalLeads, d.successfulLeads]));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      padding: 24,
      margin: 16,
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.colors.gray100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartIcon: {
      marginRight: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.secondary,
    },
    dateRange: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      backgroundColor: theme.colors.gray50,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    legend: {
      flexDirection: 'row',
      marginBottom: 28,
      gap: 24,
      justifyContent: 'center',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 8,
    },
    legendText: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '600',
    },
    chartContainer: {
      height: 220,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 20,
      backgroundColor: theme.colors.gray50,
      borderRadius: 16,
      paddingTop: 20,
    },
    barGroup: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 160,
      marginBottom: 16,
      gap: 3,
    },
    bar: {
      width: 14,
      borderRadius: 7,
      minHeight: 4,
    },
    totalLeadsBar: {
      backgroundColor: '#EF4444',
    },
    successfulLeadsBar: {
      backgroundColor: theme.colors.primary,
    },
    dayLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BarChart3 size={24} color={theme.colors.secondary} style={styles.chartIcon} />
          <Text style={styles.title}>Call Statistics</Text>
        </View>
        <Text style={styles.dateRange}>Jul 6-12</Text>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Total Calls</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>Successful Calls</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barsContainer}>
              <Animated.View
                style={[
                  styles.bar,
                  styles.totalLeadsBar,
                  { 
                    height: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, Math.max(4, (item.totalLeads / maxValue) * 160)]
                    })
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.bar,
                  styles.successfulLeadsBar,
                  { 
                    height: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, Math.max(4, (item.successfulLeads / maxValue) * 160)]
                    })
                  }
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default Chart;