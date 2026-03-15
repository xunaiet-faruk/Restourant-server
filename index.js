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
        const RegisterCollection =client.db("RegisterDB").collection("Register")
        const BuyCollection =client.db("BuyFoodDB").collection("Buyfood")

        // role baseed access 
        app.get('/register/role/:email',async(req,res)=>{
            const email =req.params.email;
            const result =await RegisterCollection.findOne({email})
            res.send({role : result?.role})
        })

        // admin  data
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

        app.post('/register',async(req,res)=>{
            const userData =req.body;
            const result =await RegisterCollection.insertOne(userData)
            res.send(result)
        })

        app.get('/register',async(req,res)=>{
            const result =await RegisterCollection.find().toArray();
            res.send(result)
        })

        app.delete('/register/:id',async(req,res)=>{
            const id =req.params.id;
            const filter ={_id : new ObjectId(id)}
            const result =await RegisterCollection.deleteOne(filter)
            res.send(result)
        })

        app.put('/register/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const { role } = req.body;

                const filter = { _id: new ObjectId(id) };
                const updateRole = {  
                    $set: {
                        role: role
                    }
                };

                const result = await RegisterCollection.updateOne(filter, updateRole); 

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }

                if (result.modifiedCount === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "User already has this role"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "User role updated successfully",
                    modifiedCount: result.modifiedCount
                });

            } catch (error) {
                console.error("Error updating user role:", error);
                res.status(500).json({
                    success: false,
                    message: "Server error",
                    error: error.message
                });
            }
        });

        app.get('/manageProuct', async (req, res) => {
            const result = await BuyCollection.find().toArray();
            res.send(result)
        })

        app.delete('/manageProuct/:id',async(req,res)=>{
            const id =req.params.id;
            const filter ={_id : new ObjectId(id)}
            const result =await BuyCollection.deleteOne(filter)
            res.send(result)
        })

        app.put('/manageProduct/:id',async(req,res)=>{
            const id =req.params.id;
            const {status } =req.body;
            const filter ={_id : new ObjectId(id)}
            const updatedStatus ={
                $set:{
                    status : status
                }
            }
            const result =await BuyCollection.updateOne(filter,updatedStatus)
            res.send(result)

        })


        //user api 

        app.post('/buyFood',async(req,res)=>{
            const Fooddata =req.body;
            const result =await BuyCollection.insertOne(Fooddata);
            res.send(result)
        })

        app.get('/buyFood/:email',async(req,res)=>{
            const email =req.params.email;
            const query ={email : email}
            const result =await BuyCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/buyFood/:id',async(req,res)=>{
            const id =req.params.id;
            const query ={_id : new ObjectId(id)}
            const result =await BuyCollection.deleteOne(query)
            res.send(result);
        })

      // user updated data 
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const result = await RegisterCollection.findOne({ email: email });
            res.send(result);
        })
        app.put('/register', async (req, res) => {

            const { email, name, photoURL } = req.body

            const filter = { email: email }

            const updateDoc = {
                $set: {
                    name: name,
                    image: photoURL
                }
            }

            const result = await RegisterCollection.updateOne(filter, updateDoc)

            res.send(result)

        })
      

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