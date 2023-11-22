import express from 'express';
import {MongoClient} from 'mongodb';

async function start(){

    const url = `mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1`;
    const client = new MongoClient(url);

    await client.connect();
    const db = client.db('myFirstDb');

    const app = express();
    app.use(express.json());

    app.get("/products", async (req, res) => {
        const products = await db.collection('products').find({}).toArray();
        res.json(products);
    });


    app.get("/product/:productId", async (req, res) => {
        const productId = req.params.productId;
        const product = await db.collection('products').findOne({id: productId});
        res.json(product);
    });

    async function populateCartIds (ids){
        return Promise.all(ids.map(id => db.collection('products').findOne({id})));
    }

    app.get("/users/:userId/cart", async (req, res) => {
        const users = await db.collection('users').findOne({id: req.params.userId});
        const populatedCart = await populateCartIds(users.cartItems);
        res.json(populatedCart);
    });

    app.post("/users/:userId/cart", async (req, res) => {
        const userId = req.params.userId;
        const productId = req.body.id;
        
        await db.collection('users').updateOne({id: userId}, {
            $addToSet: {cartItems: productId}
        })

        const users = await db.collection('users').findOne({id: userId});
        const populatedCart = await populateCartIds(users.cartItems);
        res.json(populatedCart);
    });

    app.delete("/users/:userId/cart/:productId", async (req, res) => {
        const userId = req.params.userId;
        const productId = req.params.productId;

        await db.collection('users').updateOne({id : userId}, {
            $pull: {cartItems: productId}
        })

        const users = await db.collection('users').findOne({id: userId});
        const populatedCart = await populateCartIds(users.cartItems);
        res.json(populatedCart);
    });

    app.listen(8000, () => {
        console.log("Server started listening to port 8000");
    });

}

start();
