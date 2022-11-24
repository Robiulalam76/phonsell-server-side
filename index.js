const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;


//Middleware
app.use(cors())
app.use(express.json())


async function run() {
    try {

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