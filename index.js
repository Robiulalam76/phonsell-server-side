const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


//Middleware
app.use(cors())
app.use(express.json())




const uri = process.env.DB_ACCESS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('phonsell').collection('categories')
        const productsCollection = client.db('phonsell').collection('products')
        const usersCollection = client.db('phonsell').collection('users')
        const wishlistCollection = client.db('phonsell').collection('wishlist')
        const ordersCollection = client.db('phonsell').collection('orders')

        // signup to set users
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.send(result)
        });


        // user load with query
        app.get('/users', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })

        // categories
        app.get('/categories', async (req, res) => {
            const query = {}
            const result = await categoriesCollection.find(query).toArray()
            res.send(result)
        });

        // get cotegory
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id
            const query = { categoryId: id }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        // Product add from client side
        app.post('/products', async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        // get My Products for seller
        app.post('/products', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        // add wishlist system
        app.post('/wishlist', async (req, res) => {
            const product = req.body;
            const result = await wishlistCollection.insertOne(product)
            res.send(result)
        });

        // get wishlist from database
        app.get('/wishlist', async (req, res) => {
            const query = {}
            const result = await wishlistCollection.find(query).toArray()
            res.send(result)
        })


        // get My wishlist from database
        app.get('/my-wishlist', async (req, res) => {
            const email = req.query.email
            const query = { wishlisterEmail: email }
            const result = await wishlistCollection.find(query).toArray()
            res.send(result)
        })

        // delete wishlist from database
        app.delete('/wishlist/:id', async (req, res) => {
            const id = req.params.id
            const query = { serviceId: id }
            const result = await wishlistCollection.deleteOne(query)
            res.send(result)
        })


        // set order database from user
        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })


        // get order
        app.get('/orders', async (req, res) => {
            const query = {}
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Phonsell Server is running')
})

app.listen(port, () => {
    console.log(`Phonsell server Running on ${port}`)
})