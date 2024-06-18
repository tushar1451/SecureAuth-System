const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'SHARRYY', 
    password: 'project1', 
    database: 'SIGNUP' 
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.message);
      return;
    }
    console.log('Connected to MySQL');
  });
  
  const SECRET_KEY = 'bashakshda'; 


  app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, results) => {
          if (err) {
            return res.status(500).send('Error creating user');
          }
  
          const token = jwt.sign({ userId: results.insertId }, SECRET_KEY);
          res.status(201).send({ token });
        }
      );
    } catch (error) {
      res.status(500).send('Error processing request');
    }
  });

  
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) {
          return res.status(500).send('Error processing request');
        }
  
        if (results.length === 0) {
          return res.status(400).send('Invalid credentials');
        }
  
        const user = results[0];
  
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (!passwordMatch) {
          return res.status(400).send('Invalid credentials');
        }
  
        const token = jwt.sign({ userId: user.id }, SECRET_KEY);
        res.status(200).send({ token });
      }
    );
  });
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
    