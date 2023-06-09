const express = require('express');
const app = express();

const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5600;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r7lfnhm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)


    const classesCollection = client.db('LangLinkDB').collection('classes')
    const instructorsCollection = client.db('LangLinkDB').collection('instructors')
    const usersCollection = client.db("LangLinkDB").collection("users");

    // classes api
    app.get('/classes', async (req, res) => {
      const classes = await classesCollection.find({}).toArray();
      res.send(classes)
    })


    // instructors api
    app.get('/instructors', async (req, res) => {
      const classes = await instructorsCollection.find({}).toArray();
      res.send(classes)
    })


    // users api
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// get
app.get('/', (req, res) => {
  res.send('running successfully')
})

app.listen(port, () => {
  console.log(`lang is running on port ${port}`)
})