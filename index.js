const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { ObjectId } = require('mongodb'); 
//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ybkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const serviceCollections = client.db('carsDoctor').collection('services');
    const bookingCollections = client.db('carsDoctor').collection('bookings');

    //get all services
    app.get('/services', async(req, res)=>{
        const cursor = serviceCollections.find();
        const result = await cursor.toArray();
        res.send(result);
    })
//get signle servic details
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };  // Use ObjectId to find the document by ID
        const service = await serviceCollections.findOne(query);
        res.send(service);
    });


    //post service booking
    app.post('/bookings', async(req, res) => {
        const booking = req.body;
        const result  = await bookingCollections.insertOne(booking);
        res.send(result);
    });

    app.get('/bookings', async (req, res) => {
        const email = req.query.email; // Get the email from query parameters
    
        if (!email) {
            return res.status(400).send({ message: "Email query parameter is required" });
        }
    
        try {
            const cursor = bookingCollections.find({ email: email }); // Filter bookings by email
            const result = await cursor.toArray();
            res.send(result);
        } catch (error) {
            console.error("Error fetching bookings by email:", error);
            res.status(500).send({ message: "Error fetching bookings" });
        }
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




app.get('/', (req, res) => {
    res.send('Doctor is running')
})

app.listen(port, () => {
    console.log(`Car doctor server is running on port ${port}`)
})