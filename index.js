
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    try {
        const categoryCollection = client.db('restore01').collection('products');
        const productsCollection = client.db('restore01').collection('productDetails');


        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        })

        app.get('/category', async(req, res)=>{
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products)
        })

        app.get('/category/:name', async(req,res)=>{
            const name = req.params.name;
            const query = {Category_Name: name}
            const result = await productsCollection.find(query).toArray();
            res.send(result);

        })
        
        app.post('/category', async(req,res)=>{
            const query = req.body;
            const result = await productsCollection.insertOne(query);
            res.send(result)
        })



        app.get('/myProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        app.delete('/doctors/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await doctorsCollection.deleteOne(filter);
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(err => console.log(err))



app.get('/', async (req, res) => {
    res.send('Restore server is running');
})

app.listen(port, () => console.log(`Restore running on ${port}`))