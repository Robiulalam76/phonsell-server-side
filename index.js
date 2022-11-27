const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


//Middleware
app.use(cors())
app.use(express.json())


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized Access' })
        }

        req.decoded = decoded
        next()
    })
}

const uri = process.env.DB_ACCESS_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('phonsell').collection('categories')
        const productsCollection = client.db('phonsell').collection('products')
        const usersCollection = client.db('phonsell').collection('users')
        const wishlistCollection = client.db('phonsell').collection('wishlist')
        const ordersCollection = client.db('phonsell').collection('orders')
        const reportsCollection = client.db('phonsell').collection('reports')
        const advertiseProductsCollection = client.db('phonsell').collection('advertiseProducts')


        // verify jwt token
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })
                console.log(token);
                return res.send({ accessToken: token })
            }
            // res.status(403).send({ accessToken: 'unauthorized Access' })
        })


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

        // user load with query
        app.get('/verify-users', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await usersCollection.find(query).toArray()
            // console.log(query);
            res.send(result)
        })

        // set New user
        app.get('/check-user', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user === null) {
                return res.send({ status: false })
            }
            res.send({ status: true })
        })

        // get all users
        app.get('/all-users', async (req, res) => {
            const query = { role: 'user' }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        // delete user from admin
        app.delete('/all-users/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        // get all sellers
        app.get('/all-sellers', async (req, res) => {
            const query = { role: 'seller' }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })


        // delete user from admin
        app.delete('/all-sellers/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        // verify user from admin
        app.put('/all-sellers/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    verify: true
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
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
        app.post('/products', verifyJWT, async (req, res) => {
            const product = req.body
            const result = await productsCollection.insertOne(product)
            res.send(result)
        })

        // Product delete from seller
        app.delete('/products/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        // get My Products for seller
        app.get('/my-products', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        // ----------------------------------------------------------------------
        // Product Report to admin
        app.post('/reports', verifyJWT, async (req, res) => {
            const report = req.body
            const result = await reportsCollection.insertOne(report)
            res.send(result)
        })

        // get all Report
        app.get('/reports', async (req, res) => {
            const query = {}
            const result = await reportsCollection.find(query).toArray()
            res.send(result)
        })


        // report product delete from admin
        app.delete('/reports/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { serviceId: id }
            const result = await reportsCollection.deleteOne(query)
            res.send(result)
        })

        // add wishlist system
        app.post('/wishlist', verifyJWT, async (req, res) => {
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
        app.delete('/wishlist/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { serviceId: id }
            const result = await wishlistCollection.deleteOne(query)
            res.send(result)
        })


        // set order database from user
        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })


        // get order
        app.get('/my-orders', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await ordersCollection.find(query).toArray()
            res.send(result)
        })

        // delete order
        app.delete('/my-orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })


        // advertise stored
        app.post('/advertise', verifyJWT, async (req, res) => {
            const advertiseProduct = req.body
            const result = await advertiseProductsCollection.insertOne(advertiseProduct)
            res.send(result)
        })

        // get advertise products
        app.get('/advertiseProducts', async (req, res) => {
            const query = {}
            const result = await advertiseProductsCollection.find(query).toArray()
            res.send(result)
        })

        // delete order
        app.delete('/advertiseProducts/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { serviceId: id }
            const result = await advertiseProductsCollection.deleteOne(query)
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