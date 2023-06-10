const express = require('express');
const app = express();

const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()


const port = process.env.PORT || 5600;

// middleware
app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized' });
  }
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorize' })
    }
    req.decoded = decoded;
    next();
  })
}




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden ' });
      }
      next();
    }

    // classes api
    app.get('/classes', async (req, res) => {
      const classes = await classesCollection.find({}).toArray();

      classes[0].status = 'pending';
      classes[1].status = 'denied';

      res.send(classes);
    });

    app.patch('/classes/approve/:id', verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'approved',
        },
      };

      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send({ success: result.modifiedCount > 0 });
    });

    app.patch('/classes/deny/:id', verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: 'denied',
        },
      };

      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send({ success: result.modifiedCount > 0 });
    });


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
        return res.send({ message: 'already exists user' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });



    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })




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