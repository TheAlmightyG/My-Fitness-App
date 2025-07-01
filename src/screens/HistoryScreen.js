import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  List,
  Divider,
  Chip
} from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';

const HistoryScreen = () => {
  const { getWorkouts, getExercisesByWorkout, isLoading } = useDatabase();
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const workoutData = await getWorkouts();
      setWorkouts(workoutData);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async (workoutId) => {
    if (workoutExercises[workoutId]) {
      return; // Already loaded
    }

    try {
      const exercises = await getExercisesByWorkout(workoutId);
      setWorkoutExercises(prev => ({
        ...prev,
        [workoutId]: exercises
      }));
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const toggleWorkoutExpanded = async (workoutId) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      await loadExercises(workoutId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatExerciseDetails = (exercise) => {
    const details = [];
    
    if (exercise.sets && exercise.reps) {
      details.push(`${exercise.sets} sets × ${exercise.reps} reps`);
    }
    
    if (exercise.weight) {
      details.push(`${exercise.weight} lbs`);
    }
    
    if (exercise.distance) {
      details.push(`${exercise.distance} miles`);
    }
    
    if (exercise.duration) {
      details.push(`${exercise.duration} min`);
    }

    return details.join(' • ');
  };

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Title>No Workouts Yet</Title>
        <Paragraph>Start logging your workouts to see your history here!</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Your Progress</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{workouts.length}</Title>
              <Paragraph>Total Workouts</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60)}
              </Title>
              <Paragraph>Hours Trained</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {workouts.map((workout) => (
        <Card key={workout.id} style={styles.workoutCard}>
          <TouchableOpacity onPress={() => toggleWorkoutExpanded(workout.id)}>
            <Card.Content>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Title style={styles.workoutName}>{workout.name}</Title>
                  <Paragraph style={styles.workoutDate}>
                    {formatDate(workout.date)}
                  </Paragraph>
                  {workout.duration && (
                    <Chip style={styles.durationChip} compact>
                      {workout.duration} min
                    </Chip>
                  )}
                </View>
                <List.Icon 
                  icon={expandedWorkout === workout.id ? "chevron-up" : "chevron-down"} 
                />
              </View>

              {workout.notes && (
                <Paragraph style={styles.workoutNotes}>
                  "{workout.notes}"
                </Paragraph>
              )}

              {expandedWorkout === workout.id && (
                <View style={styles.exercisesList}>
                  <Divider style={styles.divider} />
                  <Title style={styles.exercisesTitle}>Exercises:</Title>
                  
                  {workoutExercises[workout.id] ? (
                    workoutExercises[workout.id].length > 0 ? (
                      workoutExercises[workout.id].map((exercise, index) => (
                        <View key={exercise.id} style={styles.exerciseItem}>
                          <View style={styles.exerciseHeader}>
                            <Paragraph style={styles.exerciseName}>
                              {index + 1}. {exercise.name}
                            </Paragraph>
                          </View>
                          <Paragraph style={styles.exerciseDetails}>
                            {formatExerciseDetails(exercise)}
                          </Paragraph>
                        </View>
                      ))
                    ) : (
                      <Paragraph style={styles.noExercises}>
                        No exercises recorded for this workout
                      </Paragraph>
                    )
                  ) : (
                    <ActivityIndicator size="small" color="#6200ee" />
                  )}
                </View>
              )}
            </Card.Content>
          </TouchableOpacity>
        </Card>
      ))}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  statsCard: {
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
  workoutCard: {
    marginBottom: 12,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    marginBottom: 4,
  },
  workoutDate: {
    color: '#666',
    marginBottom: 8,
  },
  durationChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e8',
  },
  workoutNotes: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  exercisesList: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 12,
  },
  exercisesTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  exerciseItem: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noExercises: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HistoryScreen;