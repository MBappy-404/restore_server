
const express = require('express');
const cors = require('cors');
const { MongoClient,ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wss65wz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);

async function run() {

    try{
        const productsCollection = client.db('restore01').collection('products');


        

    }
    finally{

    }

}

run().catch(err => console.log(err))



app.get('/', async (req, res) => {
     res.send('Restore server is running');
 })
 
 app.listen(port, () => console.log(`Restore running on ${port}`))