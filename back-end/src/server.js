import express from 'express';
import {products as productsRaw, cartItems as cartItemsRaw} from './temp-data';
import {MongoClient} from 'mongodb';

let products = productsRaw;
let cartItems = cartItemsRaw;

const url = `mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1`;
const client = new MongoClient(url);

const app = express();
app.use(express.json());

app.get("/hello", async (req, res) => {
    await client.connect();
    const db = client.db('myFirstDb');
    const product = await db.collection('products').find({}).toArray();
    res.json(product);
});

app.get("/products", (req, res) => {
    res.json(products);
});


app.get("/product/:productId", (req, res) => {
    const productId = req.params.productId;
    const product = products.find(product => product.id === productId);
    res.json(product);
});

function populateCartIds (ids){
    return cartItems.map(id => products.find(product => product.id === id));
}

app.get("/cart", (req, res) => {
    const populatedCart = populateCartIds(cartItems);
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