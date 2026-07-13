// Workout Tracker API
// A localized REST API for tracking workout sessions.
// Data lives in memory (a plain array) - no database yet.

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Parse incoming JSON bodies globally so req.body works everywhere
app.use(express.json());

// Custom logger - prints timestamp, method, and route for every request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// In-memory data store
// Seeded starter workout so the array isn't empty on first run
let workouts = [
  {
    id: 1,
    exercise: 'Bench Press',
    sets: 4,
    reps: 8,
    weight: 135,
    completed: false
  }
];

// Simple counter used to generate the next unique id
let nextId = 2;

// Routes
// GET /api/workouts - return every tracked workout
app.get('/api/workouts', (req, res) => {
  res.status(200).json(workouts);
});

// GET /api/workouts/:id - return one workout, 404 if it doesn't exist
app.get('/api/workouts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return res.status(404).json({ error: `Workout with id ${id} not found` });
  }

  res.status(200).json(workout);
});

// POST /api/workouts - add a new workout to the array
app.post('/api/workouts', (req, res) => {
  const newWorkout = {
    id: nextId++,
    ...req.body
  };

  workouts.push(newWorkout);
  res.status(201).json(newWorkout);
});

// PUT /api/workouts/:id - update fields on an existing workout
app.put('/api/workouts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = workouts.findIndex((w) => w.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Workout with id ${id} not found` });
  }

  workouts[index] = { ...workouts[index], ...req.body, id };
  res.status(200).json(workouts[index]);
});

// DELETE /api/workouts/:id - remove a workout from the array
app.delete('/api/workouts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = workouts.findIndex((w) => w.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Workout with id ${id} not found` });
  }

  const deleted = workouts.splice(index, 1);
  res.status(200).json({ message: 'Deleted successfully', workout: deleted[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;