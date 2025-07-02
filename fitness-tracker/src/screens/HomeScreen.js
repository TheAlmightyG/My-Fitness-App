import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';

const HomeScreen = ({ navigation }) => {
  const { getRecentWorkouts, getWorkouts, isLoading } = useDatabase();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const recent = await getRecentWorkouts(3);
      const all = await getWorkouts();
      setRecentWorkouts(recent);
      setTotalWorkouts(all.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Welcome to Your Fitness Tracker!</Title>
          <Paragraph>Track your workouts and reach your fitness goals.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Stats</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{totalWorkouts}</Title>
              <Paragraph>Total Workouts</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {recentWorkouts.length > 0 ? 
                  Math.round((Date.now() - new Date(recentWorkouts[0].date).getTime()) / (1000 * 60 * 60 * 24)) 
                  : 0}
              </Title>
              <Paragraph>Days Since Last</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Workouts</Title>
          {recentWorkouts.length === 0 ? (
            <Paragraph>No workouts logged yet. Start by logging your first workout!</Paragraph>
          ) : (
            recentWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutItem}>
                <Title style={styles.workoutName}>{workout.name}</Title>
                <Paragraph>{formatDate(workout.date)}</Paragraph>
                {workout.duration && (
                  <Paragraph>{workout.duration} minutes</Paragraph>
                )}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => navigation.navigate('Log Workout')}
        >
          Log New Workout
        </Button>
        <Button 
          mode="outlined" 
          style={styles.button}
          onPress={() => navigation.navigate('Generate')}
        >
          Generate AI Workout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  workoutItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  workoutName: {
    fontSize: 18,
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    marginBottom: 12,
  },
});

export default HomeScreen;