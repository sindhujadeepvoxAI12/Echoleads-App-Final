import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { calendarAPI } from '../services/calendarService';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('Month');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listFilter, setListFilter] = useState('all'); // all | upcoming | week | day

  // Build marked dates from API data with multiple events per day and different colors
  const events = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const date = b.availability_date;
      if (date) {
        if (!map[date]) {
          map[date] = { 
            marked: true, 
            dotColor: '#4CAF50',
            events: []
          };
        }
        map[date].events.push(b);
        
        // Change dot color based on number of events
        if (map[date].events.length > 1) {
          map[date].dotColor = '#FF9500'; // Orange for multiple events
        }
      }
    });
    return map;
  }, [bookings]);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const res = await calendarAPI.getBookData();
      if (res && res.status && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Refresh data every minute to update upcoming events count
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render by updating a dummy state or refetching
      fetchBookings(true);
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    fetchBookings(true);
  };

  const viewModes = ['Month', 'Week', 'Day', 'List'];

  // Helpers
  const parseEventDateTime = (event) => {
    const datePart = event?.availability_date;
    const timePart = event?.availability_time || '00:00:00';
    if (!datePart) return null;
    const isoString = `${datePart}T${timePart.length === 5 ? timePart + ':00' : timePart}`;
    const dt = new Date(isoString);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const startOfToday = () => {
    const n = new Date();
    n.setHours(0, 0, 0, 0);
    return n;
  };

  const endOfToday = () => {
    const n = new Date();
    n.setHours(23, 59, 59, 999);
    return n;
  };

  const endOfThisWeek = () => {
    const n = new Date();
    // Week ends on Saturday 23:59:59
    const day = n.getDay(); // 0 Sun ... 6 Sat
    const diffToSat = 6 - day;
    const end = new Date(n);
    end.setDate(n.getDate() + diffToSat);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const nowDate = () => new Date();

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const renderViewModeSelector = () => {
    return (
      <View style={styles.viewModeContainer}>
        {viewModes.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewModeButton,
              viewMode === mode && styles.activeViewModeButton,
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === mode && styles.activeViewModeText,
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCalendar = () => {
    if (loading) {
      return (
        <View style={styles.calendarLoadingContainer}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      );
    }

    return (
      <Calendar
        current={new Date().toISOString().slice(0, 10)}
        minDate={'2024-01-01'}
        maxDate={'2026-12-31'}
        onDayPress={onDayPress}
        monthFormat={'MMMM yyyy'}
        hideExtraDays={true}
        disableMonthChange={false}
        firstDay={0}
        hideDayNames={false}
        showWeekNumbers={false}
        onPressArrowLeft={substractMonth => substractMonth()}
        onPressArrowRight={addMonth => addMonth()}
        disableArrowLeft={false}
        disableArrowRight={false}
        markedDates={{
          ...events,
          [selectedDate]: {
            selected: true,
            selectedColor: '#FF9500',
            selectedTextColor: 'white',
          },
        }}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#FF9500',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#FF9500',
          dayTextColor: '#333333',
          textDisabledColor: '#d9e1e8',
          dotColor: '#4CAF50',
          selectedDotColor: '#ffffff',
          arrowColor: '#FF9500',
          disabledArrowColor: '#d9e1e8',
          monthTextColor: '#333333',
          indicatorColor: '#FF9500',
          textDayFontFamily: 'System',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '400',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
    );
  };

  const renderEventsList = (title, sourceEvents) => {
    const sorted = [...sourceEvents].sort((a, b) => {
      const da = parseEventDateTime(a)?.getTime() || 0;
      const db = parseEventDateTime(b)?.getTime() || 0;
      return db - da; // Reverse order: newest to oldest
    });

    // Calculate dynamic height based on number of events
    const calculateListHeight = () => {
      const baseHeight = 100; // Base height for title and padding
      const eventHeight = 100; // Height per event (80px minHeight + 12px margin)
      const maxHeight = 500; // Maximum height
      const calculatedHeight = baseHeight + (sorted.length * eventHeight);
      return Math.min(calculatedHeight, maxHeight);
    };

    const dynamicListStyle = {
      ...styles.eventsList,
      height: sorted.length > 0 ? calculateListHeight() : 100,
    };

    return (
      <View style={styles.selectedDateContainer}>
        {title ? <Text style={styles.selectedDateTitle}>{title}</Text> : null}
        {sorted.length > 0 ? (
          <ScrollView 
            style={dynamicListStyle}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {sorted.map((event, index) => (
              <TouchableOpacity key={index} style={styles.eventItem} activeOpacity={0.7}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>
                    {event.availability_time ? event.availability_time.slice(0, 5) : 'N/A'}
                  </Text>
                  <Text style={styles.eventName}>
                    {event.full_name || event.bot_name || 'Unnamed Event'}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetail}>
                    Date: {event.availability_date || 'N/A'}
                  </Text>
                  <Text style={styles.eventDetail}>
                    Agent: {event.bot_name || 'N/A'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noEventsText}>No events to show</Text>
        )}
      </View>
    );
  };

  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;

    const dateEvents = events[selectedDate]?.events || [];

    // Calculate dynamic height for selected date events
    const calculateSelectedDateHeight = () => {
      const baseHeight = 100; // Base height for title and padding
      const eventHeight = 100; // Height per event (80px minHeight + 12px margin)
      const maxHeight = 500; // Maximum height
      const calculatedHeight = baseHeight + (dateEvents.length * eventHeight);
      return Math.min(calculatedHeight, maxHeight);
    };

    const dynamicSelectedDateStyle = {
      ...styles.eventsList,
      height: dateEvents.length > 0 ? calculateSelectedDateHeight() : 100,
    };

    return (
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateTitle}>Events for {selectedDate}</Text>
        {dateEvents.length > 0 ? (
          <ScrollView 
            style={dynamicSelectedDateStyle}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {dateEvents.sort((a, b) => {
              const da = parseEventDateTime(a)?.getTime() || 0;
              const db = parseEventDateTime(b)?.getTime() || 0;
              return db - da; // Sort newest to oldest
            }).map((event, index) => (
              <TouchableOpacity key={index} style={styles.eventItem} activeOpacity={0.7}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>
                    {event.availability_time ? event.availability_time.slice(0, 5) : 'N/A'}
                  </Text>
                  <Text style={styles.eventName}>
                    {event.full_name || event.bot_name || 'Unnamed Event'}
                  </Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDetail}>
                    Agent: {event.bot_name || 'N/A'}
                  </Text>
                  <Text style={styles.eventDetail}>
                    Created: {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noEventsText}>No events scheduled for this date</Text>
        )}
      </View>
    );
  };

  const renderStatsOverview = () => {
    if (loading) {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.loadingText}>Loading calendar data...</Text>
          </View>
        </View>
      );
    }

    const totalEvents = bookings.length;
    const upcomingCount = bookings.filter((b) => {
      const dt = parseEventDateTime(b);
      const now = nowDate();
      return dt && dt.getTime() > now.getTime();
    }).length;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Calendar Overview</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              setViewMode('List');
              setListFilter('all');
            }}
          >
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>📅</Text>
            </View>
            <Text style={styles.statLabel}>Total Events</Text>
            <Text style={styles.statValue}>{totalEvents}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              setViewMode('List');
              setListFilter('upcoming');
            }}
          >
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>✓</Text>
            </View>
            <Text style={styles.statLabel}>Upcoming</Text>
            <Text style={styles.statValue}>{upcomingCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Compute lists for the non-month views
  const weekEventsFromToday = useMemo(() => {
    const start = nowDate();
    const end = endOfThisWeek();
    return bookings.filter((b) => {
      const dt = parseEventDateTime(b);
      return dt && dt.getTime() >= start.getTime() && dt.getTime() <= end.getTime();
    });
  }, [bookings]);

  const todayEventsFromNow = useMemo(() => {
    const start = nowDate();
    const startDay = startOfToday();
    const end = endOfToday();
    return bookings.filter((b) => {
      const dt = parseEventDateTime(b);
      if (!dt) return false;
      // If event is today, only include from now forward; if earlier today, exclude
      if (dt.getTime() >= start.getTime() && dt.getTime() <= end.getTime()) return true;
      // If now is earlier than today's start (unlikely), also include
      return dt.getTime() >= startDay.getTime() && dt.getTime() <= end.getTime() && start.getTime() <= end.getTime();
    });
  }, [bookings]);

  const upcomingEvents = useMemo(() => {
    const start = nowDate();
    const upcoming = bookings.filter((b) => {
      const dt = parseEventDateTime(b);
      return dt && dt.getTime() > start.getTime();
    });
    console.log('📅 Upcoming events count:', upcoming.length, 'Current time:', start.toISOString());
    return upcoming;
  }, [bookings]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.pageTitle}>Calendar</Text>
          <Text style={styles.pageSubtitle}>Manage your schedule</Text>
          
          {renderViewModeSelector()}
          {renderStatsOverview()}
          {viewMode === 'Month' && renderCalendar()}
          {viewMode === 'Week' && renderEventsList('This Week Events', weekEventsFromToday)}
          {viewMode === 'Day' && renderEventsList('Today', todayEventsFromNow)}
          {viewMode === 'List' &&
            renderEventsList(
              listFilter === 'upcoming' ? 'Upcoming Events' : 'All Events',
              listFilter === 'upcoming' ? upcomingEvents : bookings
            )}
          {viewMode === 'Month' && renderSelectedDateInfo()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to account for tab bar height
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15, // Moderate padding top
    paddingBottom: 20, // Add bottom padding
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeViewModeButton: {
    backgroundColor: '#FF9500',
    borderWidth: 0,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewModeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeViewModeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  calendarLoadingContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  selectedDateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    flex: 1, // Make container flexible
    minHeight: 120, // Minimum height for empty state
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  selectedDateText: {
    fontSize: 18,
    color: '#FF9500',
    fontWeight: '600',
    marginBottom: 8,
  },
  eventsList: {
    maxHeight: 500, // Increased height to accommodate more events
    flex: 1,
  },
  eventItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16, // Increased padding for better spacing
    marginBottom: 12, // Increased margin between cards
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    minHeight: 80, // Set minimum height for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    minWidth: 60, // Ensure time has consistent width
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginLeft: 12,
    lineHeight: 20, // Better line height for readability
  },
  eventDetails: {
    marginTop: 8, // Increased margin for better separation
  },
  eventDetail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4, // Increased margin between details
    lineHeight: 18, // Better line height for readability
  },
  noEventsText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
});

export default CalendarPage;