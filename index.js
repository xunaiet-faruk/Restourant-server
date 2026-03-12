const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.kwkb8qp.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const FoodCollection =client.db("RestourantFoodDB").collection("AllFood")

        // admin post data
        app.post('/Addfood',async(req,res)=>{
            const data =req.body;
            const result =await FoodCollection.insertOne(data);
            res.send(result)
        })

        app.get('/Allfood',async(req,res)=>{
            const menu =await FoodCollection.find().toArray()
            res.send(menu)
        })

        app.delete('/Allfood/:id',async(req,res)=>{
            const id =req.params.id
            const query ={_id : new ObjectId(id)}
            const result =await FoodCollection.deleteOne(query)
            res.send(result)
        })

        app.put('/Allfood/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedFood = req.body; 

                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        name: updatedFood.name,
                        category: updatedFood.category,
                        price: updatedFood.price,
                        recipe: updatedFood.description || updatedFood.recipe,
                        image: updatedFood.image,
                        status: updatedFood.status,
                        rating: updatedFood.rating,
                        discount: updatedFood.discount,
                      
                    }
                };

                const result = await FoodCollection.updateOne(filter, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: "Food not found" });
                }

                res.status(200).json({
                    message: "Food updated successfully",
                    result
                });

            } catch (error) {
                console.error("Update error:", error);
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Restaurant Server Running');
});

app.listen(port, () => {
    console.log(`Restaurant Server listening on port ${port}`);
});