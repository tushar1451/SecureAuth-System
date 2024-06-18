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
    const { firstName, lastName, username, email, password } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    const nameRegex = /^[A-Za-z]+$/;
    if (!username || !password || !firstName || !lastName || !email) {
        return res.status(400).send('Please enter all details');
      }
    if (!email.includes("@"))
    {
        return res.status(400).send('Please enter a valid email address');

    }
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return res.status(400).send('First name and last name must contain only letters');
      }
    
    if (!passwordRegex.test(password)) {
        return res.status(400).send('Password must contain at least one uppercase letter, one number, and one special character, and be at least 8 characters long');
      }
  
      db.query(
        'SELECT * FROM users1 WHERE username = ?',
        [username],
        async (err, results) => {
          if (err) {
            return res.status(500).send('Error checking username uniqueness');
          }
    
          if (results.length > 0) {
            return res.status(400).send('Username is already taken');
          }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const token = jwt.sign({ userId: results.insertId }, SECRET_KEY);
      db.query(
        'INSERT INTO users1 (firstName, lastName, username, email, password, token) VALUES (?, ?, ?, ?, ?, ?)',
        [firstName, lastName, username, email, hashedPassword, token],
        (err, results) => {
          if (err) {
            return res.status(500).send('Error creating user');
          }
  
          
          res.status(201).send({ token });
        }
      );
    } catch (error) {
      res.status(500).send('Error processing request');
    }
}
      );
    });

  
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    db.query(
      'SELECT * FROM users1 WHERE username = ?',
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
        res.status(200).send({ message: "Welcome "  + user.firstName + "Your token is " + user.token});
      }
    );
  });
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
    