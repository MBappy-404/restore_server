
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wss65wz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri);


//verify jwt
function verifyJWT(req, res, next) {

    // console.log(req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorize Access');

    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {

    try {
        const categoryCollection = client.db('restore01').collection('products');
        const productsCollection = client.db('restore01').collection('productDetails');
        const ordersCollection = client.db('restore01').collection('orders');
        const usersCollection = client.db('restore01').collection('users');
        const paymentsCollection = client.db('restore01').collection('payments');


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);

            if (user) {
                 const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
                 return res.send({ accessToken: token })

            }
            // console.log(user);
            res.status(403).send('Unauthorize Access Request')


       })

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

        app.delete('/category/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });


        app.put('/category/:id', async (req, res) => {
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

        //soldOut update database 
        app.put('/category/soldOut/:id', async(req,res)=>{
            const id = req.params.id;
            const filter = { _id: ObjectId(id)}
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    soldOut: true,

                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })

        app.put('/reported/:id', async (req, res) => {
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

        app.put('/category', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    verify: 'true'
                }
            }
            const result = await productsCollection.updateMany(query, updatedDoc, options);
            res.send(result);
            // console.log(email);
        });



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

        // store booked  orders 

        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result)
        })

        app.get('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await ordersCollection.findOne(query);
            res.send(result)
        })

        //get order by user email 
        app.get('/orders', verifyJWT, async (req, res) => {

            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        });

        //manage users

        app.put('/users', async (req, res) => {
            const users = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: users
            }
            const result = await usersCollection.updateOne(users, updatedDoc, options);
            res.send(result);
        })


        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const deleteUser = await usersCollection.deleteOne(filter);
            res.send(deleteUser)
        })


        app.get('/users/verify', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            res.send(user);

        });

        //payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const order = req.body;
            const price = order.product_price;
            const amount = price;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        //store payment
        
        app.post('/payments', async (req, res) =>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.orderId
            const filter = {_id: ObjectId(id)}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await ordersCollection.updateOne(filter, updatedDoc)
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