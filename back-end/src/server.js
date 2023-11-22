import express from 'express';
import {products as productsRaw, cartItems as cartItemsRaw} from './temp-data';
import {MongoClient} from 'mongodb';

let products = productsRaw;
let cartItems = cartItemsRaw;

const url = `mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1`;
const client = new MongoClient(url);

const app = express();
app.use(express.json());

app.get("/products", async (req, res) => {
    await client.connect();
    const db = client.db('myFirstDb');
    const product = await db.collection('products').find({}).toArray();
    res.json(product);
});


app.get("/product/:productId", (req, res) => {
    const productId = req.params.productId;
    const product = products.find(product => product.id === productId);
    res.json(product);
});

async function populateCartIds (ids){
    await client.connect();
    const db = client.db('myFirstDb');
    return Promise.all(ids.map(id => db.collection('products').find({id})));
}

app.get("/users/:userId/cart", async (req, res) => {
    await client.connect();
    const db = client.db('myFirstDb');
    const users = db.collection('users').findOne({id: req.params.userId});
    const populatedCart = populateCartIds(users.cartItems);
    res.json(populatedCart);
});

app.post("/cart", (req, res) => {
    const productId = req.body.id;
    cartItems.push(productId);
    const populatedCart = populateCartIds(cartItems);
    res.json(populatedCart);
});

app.delete("/cart/:productId", (req, res) => {
    const productId = req.params.productId;
    cartItems = cartItems.filter(id => id !== productId);
    const populatedCart = populateCartIds(cartItems);
    res.json(populatedCart);
});

app.listen(8000, () => {
    console.log("Server started listening to port 8000");
});