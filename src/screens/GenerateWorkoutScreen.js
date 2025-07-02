import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  ActivityIndicator,
  Chip,
  RadioButton
} from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';
import { OPENAI_API_KEY } from '@env';

const GenerateWorkoutScreen = ({ navigation }) => {
  const { getWorkouts, getExercisesByWorkout } = useDatabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState('');
  const [preferences, setPreferences] = useState({
    duration: '45',
    intensity: 'moderate',
    focus: 'full-body',
    equipment: 'gym',
    experience: 'intermediate'
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);


  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    try {
      const workouts = await getWorkouts();
      const recent = workouts.slice(0, 5); // Get last 5 workouts
      
      // Load exercises for each recent workout
      const workoutsWithExercises = await Promise.all(
        recent.map(async (workout) => {
          const exercises = await getExercisesByWorkout(workout.id);
          return { ...workout, exercises };
        })
      );
      
      setRecentWorkouts(workoutsWithExercises);
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    }
  };

  const generateWorkoutPrompt = () => {
    let prompt = `Generate a ${preferences.duration}-minute ${preferences.intensity} intensity ${preferences.focus} workout for someone with ${preferences.experience} experience level using ${preferences.equipment} equipment.`;
    
    if (recentWorkouts.length > 0) {
      prompt += '\n\nRecent workout history:\n';
      recentWorkouts.forEach((workout, index) => {
        prompt += `${index + 1}. ${workout.name} (${workout.date}):\n`;
        workout.exercises.forEach(exercise => {
          prompt += `   - ${exercise.name}`;
          if (exercise.sets && exercise.reps) {
            prompt += ` (${exercise.sets} sets × ${exercise.reps} reps`;
            if (exercise.weight) prompt += ` @ ${exercise.weight} lbs`;
            prompt += ')';
          }
          if (exercise.duration) prompt += ` (${exercise.duration} min)`;
          prompt += '\n';
        });
      });
      
      prompt += '\nPlease consider this history to avoid repetition and ensure progressive overload where appropriate.';
    }
    
    prompt += '\n\nFormat the response as a structured workout with:\n1. Warm-up (5-10 minutes)\n2. Main workout with specific exercises, sets, reps, and rest periods\n3. Cool-down (5-10 minutes)\n\nInclude brief explanations for exercise selection and any modifications for different fitness levels.';
    
    return prompt;
  };

  const generateWorkout = async () => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY) {
      Alert.alert(
        'API Key Required', 
        'Please add your OpenAI API key to the GenerateWorkoutScreen.js file to use this feature.'
      );
      return;
    }

    setIsLoading(true);
    setGeneratedWorkout('');

    try {
      const prompt = generateWorkoutPrompt();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a certified personal trainer and fitness expert. Create detailed, safe, and effective workout plans.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const workout = data.choices[0].message.content;
      setGeneratedWorkout(workout);

    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert(
        'Error', 
        'Failed to generate workout. Please check your internet connection and API key.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>AI Workout Generator</Title>
          <Paragraph>
            Tell us your preferences and we'll generate a personalized workout based on your history and goals.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Workout Preferences</Title>
          
          <View style={styles.preferenceSection}>
            <Paragraph style={styles.sectionTitle}>Duration (minutes)</Paragraph>
            <TextInput
              value={preferences.duration}
              onChangeText={(value) => updatePreference('duration', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.preferenceSection}>
            <Paragraph style={styles.sectionTitle}>Intensity Level</Paragraph>
            <View style={styles.chipRow}>
              {['light', 'moderate', 'intense'].map(intensity => (
                <Chip
                  key={intensity}
                  selected={preferences.intensity === intensity}
                  onPress={() => updatePreference('intensity', intensity)}
                  style={styles.chip}
                >
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.preferenceSection}>
            <Paragraph style={styles.sectionTitle}>Workout Focus</Paragraph>
            <View style={styles.chipRow}>
              {[
                { key: 'full-body', label: 'Full Body' },
                { key: 'upper-body', label: 'Upper Body' },
                { key: 'lower-body', label: 'Lower Body' },
                { key: 'cardio', label: 'Cardio' },
                { key: 'strength', label: 'Strength' }
              ].map(focus => (
                <Chip
                  key={focus.key}
                  selected={preferences.focus === focus.key}
                  onPress={() => updatePreference('focus', focus.key)}
                  style={styles.chip}
                >
                  {focus.label}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.preferenceSection}>
            <Paragraph style={styles.sectionTitle}>Equipment Available</Paragraph>
            <View style={styles.radioGroup}>
              {[
                { key: 'gym', label: 'Full Gym Access' },
                { key: 'home', label: 'Home Equipment' },
                { key: 'bodyweight', label: 'Bodyweight Only' }
              ].map(equipment => (
                <View key={equipment.key} style={styles.radioOption}>
                  <RadioButton
                    value={equipment.key}
                    status={preferences.equipment === equipment.key ? 'checked' : 'unchecked'}
                    onPress={() => updatePreference('equipment', equipment.key)}
                  />
                  <Paragraph>{equipment.label}</Paragraph>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.preferenceSection}>
            <Paragraph style={styles.sectionTitle}>Experience Level</Paragraph>
            <View style={styles.chipRow}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <Chip
                  key={level}
                  selected={preferences.experience === level}
                  onPress={() => updatePreference('experience', level)}
                  style={styles.chip}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={generateWorkout}
        loading={isLoading}
        disabled={isLoading}
        style={styles.generateButton}
      >
        {isLoading ? 'Generating...' : 'Generate AI Workout'}
      </Button>

      {generatedWorkout && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Your Generated Workout</Title>
            <ScrollView style={styles.workoutContent}>
              <Paragraph style={styles.workoutText}>
                {generatedWorkout}
              </Paragraph>
            </ScrollView>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  // Navigate to log workout screen with pre-filled data
                  navigation.navigate('Log Workout');
                }}
                style={styles.actionButton}
              >
                Log This Workout
              </Button>
              <Button
                mode="contained-tonal"
                onPress={generateWorkout}
                style={styles.actionButton}
              >
                Generate New
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {recentWorkouts.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Workout History</Title>
            <Paragraph style={styles.historyNote}>
              The AI considers your recent workouts to create varied and progressive routines.
            </Paragraph>
            {recentWorkouts.slice(0, 3).map((workout, index) => (
              <View key={workout.id} style={styles.historyItem}>
                <Paragraph style={styles.historyWorkout}>
                  {workout.name} - {new Date(workout.date).toLocaleDateString()}
                </Paragraph>
                <Paragraph style={styles.historyExercises}>
                  {workout.exercises.slice(0, 3).map(ex => ex.name).join(', ')}
                  {workout.exercises.length > 3 && '...'}
                </Paragraph>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
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
    marginBottom: 8,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  generateButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  workoutContent: {
    maxHeight: 400,
    marginVertical: 12,
  },
  workoutText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 0.48,
  },
  historyNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyWorkout: {
    fontWeight: '500',
    marginBottom: 4,
  },
  historyExercises: {
    fontSize: 12,
    color: '#666',
  },
});

export default GenerateWorkoutScreen;