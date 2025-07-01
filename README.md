# Fitness Tracker App

A React Native fitness tracking application with AI-powered workout generation using OpenAI's API.

## Features

- **Workout Logging**: Log exercises with sets, reps, weight, duration, and notes
- **Workout History**: View and track your fitness progress over time
- **AI Workout Generation**: Get personalized workouts based on your history and preferences
- **Progress Tracking**: See statistics and trends in your fitness journey
- **Offline Storage**: Uses SQLite for local data storage

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- OpenAI API key (for AI workout generation)

### Installation

1. **Create a new Expo project:**
   ```bash
   npx create-expo-app fitness-tracker
   cd fitness-tracker
   ```

2. **Replace the default files with the provided code:**
   - Copy all the files from the artifacts into your project
   - Maintain the folder structure as shown

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Add your OpenAI API key:**
   - Open `src/screens/GenerateWorkoutScreen.js`
   - Replace `'your-openai-api-key-here'` with your actual OpenAI API key
   - Get your API key from: https://platform.openai.com/api-keys

5. **Create the required folders:**
   ```bash
   mkdir -p src/screens src/context
   ```

6. **Start the development server:**
   ```bash
   npm start
   ```

## Project Structure

```
fitness-tracker/
├── App.js                           # Main application entry point
├── package.json                     # Dependencies and scripts
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel configuration
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard/home screen
│   │   ├── LogWorkoutScreen.js     # Workout logging interface
│   │   ├── HistoryScreen.js        # Workout history display
│   │   └── GenerateWorkoutScreen.js # AI workout generation
│   └── context/
│       └── DatabaseContext.js      # SQLite database management
└── README.md                       # This file
```

## Usage

### Logging Workouts
1. Navigate to the "Log Workout" tab
2. Enter workout details (name, date, duration, notes)
3. Add exercises with sets, reps, weight, etc.
4. Save the workout to your local database

### Viewing History
1. Go to the "History" tab
2. View all your past workouts
3. Tap on any workout to see detailed exercise information
4. Track your progress over time

### Generating AI Workouts
1. Visit the "Generate" tab
2. Set your preferences (duration, intensity, focus area, etc.)
3. Click "Generate AI Workout"
4. Review the generated workout plan
5. Optionally log the workout to your history

## Database Schema

### Workouts Table
- `id`: Primary key
- `date`: Workout date
- `name`: Workout name
- `duration`: Duration in minutes
- `notes`: Additional notes
- `created_at`: Timestamp

### Exercises Table
- `id`: Primary key
- `workout_id`: Foreign key to workouts table
- `name`: Exercise name
- `sets`: Number of sets
- `reps`: Number of repetitions
- `weight`: Weight used (lbs)
- `distance`: Distance (for cardio)
- `duration`: Exercise duration (minutes)

## Customization

### Adding New Exercise Types
1. Modify the `LogWorkoutScreen.js` to include new fields
2. Update the database schema in `DatabaseContext.js`
3. Adjust the AI prompt in `GenerateWorkoutScreen.js`

### Styling
- The app uses React Native Paper for UI components
- Modify the `styles` objects in each screen for custom styling
- Primary color is `#6200ee` (purple) - change this throughout for different themes

## API Integration

The app integrates with OpenAI's GPT-3.5-turbo model for workout generation. The AI considers:
- Your workout history
- Exercise preferences
- Fitness level
- Available equipment
- Desired intensity and duration

## Troubleshooting

### Common Issues

1. **Database not initializing**: Ensure expo-sqlite is properly installed
2. **API key errors**: Verify your OpenAI API key is correct and has sufficient credits
3. **Build errors**: Make sure all dependencies are installed with `npm install`

### Development Tips

- Use Expo DevTools for debugging
- Test on both iOS and Android simulators
- Use console.log for debugging database operations
- Check the Expo documentation for platform-specific issues

## Next Steps

Consider adding these features:
- User authentication
- Cloud sync
- Exercise form videos
- Progress photos
- Nutrition tracking
- Social features
- Wearable device integration

## License

This project is for educational purposes. Make sure to comply with OpenAI's usage policies when using their API.