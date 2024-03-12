import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Koneksi ke database PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Middleware untuk parsing body dari JSON
app.use(express.json());

// Endpoint untuk menampilkan list semua film
app.get('/movies', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menampilkan film berdasarkan id
app.get('/movies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie by id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menambahkan film ke database
app.post('/movies', async (req: Request, res: Response) => {
  const { title, year, imdbID, type, poster } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO movies (title, year, imdbID, type, poster) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, year, imdbID, type, poster]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk menghapus film dari database berdasarkan id
app.delete('/movies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM movies WHERE id = $1', [id]);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk melakukan update pada film berdasarkan id
app.put('/movies/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, year, imdbID, type, poster } = req.body;
  try {
    const result = await pool.query(
      'UPDATE movies SET title = $1, year = $2, imdbID = $3, type = $4, poster = $5 WHERE id = $6 RETURNING *',
      [title, year, imdbID, type, poster, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint untuk melakukan pencarian film dengan nama
app.get('/search', async (req: Request, res: Response) => {
  const { title } = req.query;
  try {
    const result = await pool.query('SELECT * FROM movies WHERE title ILIKE $1', [`%${title}%`]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Jalankan server Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
