import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  IconButton,
  Chip
} from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';

const LogWorkoutScreen = ({ navigation }) => {
  const { addWorkout, addExercise } = useDatabase();
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addExerciseToWorkout = () => {
    const newExercise = {
      id: Date.now(), // temporary ID
      name: '',
      type: 'strength', // strength, cardio, flexibility
      sets: '',
      reps: '',
      weight: '',
      distance: '',
      duration: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsLoading(true);

    try {
      const workoutData = {
        name: workoutName,
        date: workoutDate,
        duration: workoutDuration ? parseInt(workoutDuration) : null,
        notes: workoutNotes
      };

      const workoutId = await addWorkout(workoutData);

      // Save exercises
      for (const exercise of exercises) {
        if (exercise.name.trim()) {
          const exerciseData = {
            workout_id: workoutId,
            name: exercise.name,
            sets: exercise.sets ? parseInt(exercise.sets) : null,
            reps: exercise.reps ? parseInt(exercise.reps) : null,
            weight: exercise.weight ? parseFloat(exercise.weight) : null,
            distance: exercise.distance ? parseFloat(exercise.distance) : null,
            duration: exercise.duration ? parseInt(exercise.duration) : null
          };
          await addExercise(exerciseData);
        }
      }

      Alert.alert('Success', 'Workout saved successfully!', [
        { text: 'OK', onPress: () => {
          // Reset form
          setWorkoutName('');
          setWorkoutDate(new Date().toISOString().split('T')[0]);
          setWorkoutDuration('');
          setWorkoutNotes('');
          setExercises([]);
          navigation.navigate('Home');
        }}
      ]);

    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Log New Workout</Title>
          
          <TextInput
            label="Workout Name"
            value={workoutName}
            onChangeText={setWorkoutName}
            style={styles.input}
            placeholder="e.g., Upper Body Strength"
          />

          <TextInput
            label="Date"
            value={workoutDate}
            onChangeText={setWorkoutDate}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            label="Duration (minutes)"
            value={workoutDuration}
            onChangeText={setWorkoutDuration}
            style={styles.input}
            keyboardType="numeric"
            placeholder="60"
          />

          <TextInput
            label="Notes"
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="How did you feel? Any observations?"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.exerciseHeader}>
            <Title>Exercises</Title>
            <Button 
              mode="contained-tonal" 
              onPress={addExerciseToWorkout}
              compact
            >
              Add Exercise
            </Button>
          </View>

          {exercises.map((exercise, index) => (
            <Card key={exercise.id} style={styles.exerciseCard}>
              <Card.Content>
                <View style={styles.exerciseRow}>
                  <Paragraph style={styles.exerciseNumber}>#{index + 1}</Paragraph>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeExercise(exercise.id)}
                  />
                </View>

                <TextInput
                  label="Exercise Name"
                  value={exercise.name}
                  onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                  style={styles.input}
                  placeholder="e.g., Bench Press"
                />

                <View style={styles.exerciseTypeRow}>
                  <Chip
                    selected={exercise.type === 'strength'}
                    onPress={() => updateExercise(exercise.id, 'type', 'strength')}
                    style={styles.typeChip}
                  >
                    Strength
                  </Chip>
                  <Chip
                    selected={exercise.type === 'cardio'}
                    onPress={() => updateExercise(exercise.id, 'type', 'cardio')}
                    style={styles.typeChip}
                  >
                    Cardio
                  </Chip>
                </View>

                {exercise.type === 'strength' && (
                  <View style={styles.exerciseInputRow}>
                    <TextInput
                      label="Sets"
                      value={exercise.sets}
                      onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                      style={[styles.input, styles.smallInput]}
                      keyboardType="numeric"
                    />
                    <TextInput
                      label="Reps"
                      value={exercise.reps}
                      onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                      style={[styles.input, styles.smallInput]}
                      keyboardType="numeric"
                    />
                    <TextInput
                      label="Weight (lbs)"
                      value={exercise.weight}
                      onChangeText={(value) => updateExercise(exercise.id, 'weight', value)}
                      style={[styles.input, styles.smallInput]}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {exercise.type === 'cardio' && (
                  <View style={styles.exerciseInputRow}>
                    <TextInput
                      label="Distance"
                      value={exercise.distance}
                      onChangeText={(value) => updateExercise(exercise.id, 'distance', value)}
                      style={[styles.input, styles.smallInput]}
                      keyboardType="numeric"
                    />
                    <TextInput
                      label="Duration (min)"
                      value={exercise.duration}
                      onChangeText={(value) => updateExercise(exercise.id, 'duration', value)}
                      style={[styles.input, styles.smallInput]}
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveWorkout}
        loading={isLoading}
        disabled={isLoading}
        style={styles.saveButton}
      >
        Save Workout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeChip: {
    marginRight: 8,
  },
  exerciseInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default LogWorkoutScreen;