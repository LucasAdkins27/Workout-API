// Workout Tracker API
// A REST API for tracking workout sessions. Data now lives in
// a real PostgreSQL database instead of an in-memory array.

const express = require('express');
const pool = require('./db');

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


// Routes
// GET /api/workouts - return every workout from the database
app.get('/api/workouts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workouts');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/workouts/:id - return one workout, 404 if it doesn't exist
app.get('/api/workouts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Workout with id ${id} not found` });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/workouts - insert a new workout into the database
app.post('/api/workouts', async (req, res) => {
  const { exercise, sets, reps, weight, completed } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO workouts (exercise, sets, reps, weight, completed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [exercise, sets, reps, weight, completed]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PUT /api/workouts/:id - update fields on an existing workout
app.put('/api/workouts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const existing = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: `Workout with id ${id} not found` });
    }

    // merge the existing row with whatever fields came in the request body
    const updatedWorkout = { ...existing.rows[0], ...req.body };

    const result = await pool.query(
      'UPDATE workouts SET exercise = $1, sets = $2, reps = $3, weight = $4, completed = $5 WHERE id = $6 RETURNING *',
      [
        updatedWorkout.exercise,
        updatedWorkout.sets,
        updatedWorkout.reps,
        updatedWorkout.weight,
        updatedWorkout.completed,
        id
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE /api/workouts/:id - remove a workout from the database
app.delete('/api/workouts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM workouts WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Workout with id ${id} not found` });
    }

    res.status(200).json({ message: 'Deleted successfully', workout: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
