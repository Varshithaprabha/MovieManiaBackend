require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// GET all movies
app.get('/movies', (req, res) => {
  db.query('SELECT * FROM movies', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET movie by ID
app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM movies WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Movie not found' });
    res.json(results[0]);
  });
});

// POST new movie (with input sanitization)
app.post('/movies', (req, res) => {
  const { title, genre, description, poster_url, rating } = req.body;
  if (!title || !genre || rating < 0 || rating > 10) {
    return res.status(400).json({ message: 'Invalid input' });
  }
  db.query(
    'INSERT INTO movies (title, genre, description, poster_url, rating) VALUES (?, ?, ?, ?, ?)',
    [title, genre, description, poster_url, rating],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId });
    }
  );
});

// PUT update movie
app.put('/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title, genre, description, poster_url, rating } = req.body;
  if (rating && (rating < 0 || rating > 10)) {
    return res.status(400).json({ message: 'Invalid rating' });
  }
  db.query(
    'UPDATE movies SET title = ?, genre = ?, description = ?, poster_url = ?, rating = ? WHERE id = ?',
    [title, genre, description, poster_url, rating, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Movie not found' });
      res.json({ message: 'Movie updated' });
    }
  );
});

// DELETE movie
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM movies WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));