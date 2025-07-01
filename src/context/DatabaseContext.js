import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('fitness_tracker.db');
      
      // Create tables
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          name TEXT NOT NULL,
          duration INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER,
          name TEXT NOT NULL,
          sets INTEGER,
          reps INTEGER,
          weight REAL,
          distance REAL,
          duration INTEGER,
          FOREIGN KEY (workout_id) REFERENCES workouts (id)
        );
      `);

      setDb(database);
      setIsLoading(false);
    } catch (error) {
      console.error('Database initialization error:', error);
      setIsLoading(false);
    }
  };

  const addWorkout = async (workoutData) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO workouts (date, name, duration, notes) VALUES (?, ?, ?, ?)',
        [workoutData.date, workoutData.name, workoutData.duration, workoutData.notes]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };

  const addExercise = async (exerciseData) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO exercises (workout_id, name, sets, reps, weight, distance, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [exerciseData.workout_id, exerciseData.name, exerciseData.sets, exerciseData.reps, exerciseData.weight, exerciseData.distance, exerciseData.duration]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const getWorkouts = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM workouts ORDER BY date DESC');
      return result;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
  };

  const getExercisesByWorkout = async (workoutId) => {
    try {
      const result = await db.getAllAsync('SELECT * FROM exercises WHERE workout_id = ?', [workoutId]);
      return result;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  };

  const getRecentWorkouts = async (limit = 5) => {
    try {
      const result = await db.getAllAsync('SELECT * FROM workouts ORDER BY date DESC LIMIT ?', [limit]);
      return result;
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      return [];
    }
  };

  const value = {
    db,
    isLoading,
    addWorkout,
    addExercise,
    getWorkouts,
    getExercisesByWorkout,
    getRecentWorkouts,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};