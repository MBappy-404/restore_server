
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
        const ordersCollection = client.db('restore01').collection('orders');
        const usersCollection = client.db('restore01').collection('users');


        app.get('/categories', async (req, res) => {
            const query = {};
            const category = await categoryCollection.find(query).toArray();
            res.send(category);
        })

        app.get('/category', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products)
        })

        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            const query = { Category_Name: name }
            const result = await productsCollection.find(query).toArray();
            res.send(result);

        })

        //reported item 

        app.delete('/category/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });


        app.put('/category/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    reported: 'true',
                     
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        app.put('/reported/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                     
                    ads: 'true'
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });
        // app.get('/category/user?email', async(req, res)=>{
        //     const email = req.params.email;
        //     const filter = {email: email};
        //     const user = await productsCollection.findOne(filter).toArray();
        //     res.send(user)
        // })
        // app.put('/category/:email',  async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email : email }
        //     const options = { upsert: true }
        //     const updatedDoc = {
        //         $set: {
        //             verify: 'true'
        //         }
        //     }
        //     const result = await productsCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        //     // console.log(result);
        // });

       

        app.post('/category', async (req, res) => {
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

        app.delete('/myProducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        })

        // orders 

        app.post('/orders', async(req,res)=>{
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result)
        })

         app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });

        //manage users

        app.put('/users', async(req, res)=>{
            const users = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: users
            }
            const result = await usersCollection.updateOne(users,updatedDoc,options);
            res.send(result);
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.delete('/users/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const deleteUser = await usersCollection.deleteOne(filter);
            res.send(deleteUser)
        })

        //seller verify
        app.put('/users/:id',  async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'true'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

    }
    finally {

    }

}

run().catch(err => console.log(err))



app.get('/', async (req, res) => {
    res.send('Restore server is running');
})

app.listen(port, () => console.log(`Restore running on ${port}`))