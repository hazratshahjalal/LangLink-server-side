const express = require('express');
const app = express();

const cors = require('cors')

const port = process.env.PORT || 5600;

// middleware
app.use(cors());
app.use(express.json());

// get
app.get('/', (req, res) => {
  res.send('running successfully')
})

app.listen(port, () => {
  console.log(`lang is running on port ${port}`)
})