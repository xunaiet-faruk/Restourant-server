const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const SSLCommerzPayment = require('sslcommerz-lts')
// middleware

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://restorant-web.web.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}))

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
        // await client.connect();
        const FoodCollection =client.db("RestourantFoodDB").collection("AllFood")
        const RegisterCollection =client.db("RegisterDB").collection("Register")
        const BuyCollection =client.db("BuyFoodDB").collection("Buyfood")
        const PayCollection =client.db("BuyFoodDB").collection("Payfood")

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


        // payment gatway 
     

        app.post('/create-ssl-payment', async (req, res) => {
            try {
               
                const payment = req.body;

                console.log("🔥 Payment Data:", payment);

              
                if (!PayCollection) {
                    console.error("❌ PayCollection not initialized");
                    return res.status(500).send({
                        error: "Database not ready"
                    });
                }

                const tran_id = new ObjectId().toString();
                const productNames = payment.products?.map(p => p.name).join(', ') || 'Food Items';
                const totalAmount = payment.price || 0;

                const store_id = process.env.STORE_ID;
                const store_passwd = process.env.STORE_PASS;

                // Check store credentials
                if (!store_id || !store_passwd) {
                    console.error("❌ Store credentials missing");
                    return res.status(500).send({
                        error: "Payment gateway not configured"
                    });
                }

                const is_live = false; 

                const data = {
                    store_id,
                    store_passwd,
                    total_amount: totalAmount,
                    currency: 'BDT',
                    tran_id,
                    success_url: `http://localhost:3000/payment/success/${tran_id}`,
                    fail_url: `http://localhost:3000/payment/fail/${tran_id}`,
                    cancel_url: `http://localhost:3000/payment/cancel/${tran_id}`,
                    ipn_url: 'http://localhost:3000/ipn',
                    shipping_method: 'Courier',
                    product_name: productNames,
                    product_category: 'Food',
                    product_profile: 'general',
                    cus_name: payment.cus_name || 'Customer',
                    cus_email: payment.email,
                    cus_add1: payment.address || 'Dhaka',
                    cus_add2: 'Dhaka',
                    cus_city: payment.city || 'Dhaka',
                    cus_state: 'Dhaka',
                    cus_postcode: payment.postalCode || '1000',
                    cus_country: 'Bangladesh',
                    cus_phone: payment.phone || '01700000000',
                    cus_fax: '01711111111',
                    ship_name: 'Customer Name',
                    ship_add1: 'Dhaka',
                    ship_add2: 'Dhaka',
                    ship_city: 'Dhaka',
                    ship_state: 'Dhaka',
                    ship_postcode: 1000,
                    ship_country: 'Bangladesh',
                };

                console.log("🚀 Sending to SSLCommerz:", data);

                const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
                const apiResponse = await sslcz.init(data);

                console.log("📥 SSLCommerz Response:", apiResponse);

                if (apiResponse?.status === 'SUCCESS' && apiResponse?.GatewayPageURL) {
                    console.log('✅ Redirecting to: ', apiResponse.GatewayPageURL);

                    const finalOrder = {
                        payment,
                        paidStatus: false,
                        transitionId: tran_id,
                        createdAt: new Date()
                    };

                  
                    const result = await PayCollection.insertOne(finalOrder);
                    console.log("✅ Order saved to DB:", result.insertedId);

                    res.send({ url: apiResponse.GatewayPageURL });
                } else {
                    console.log('❌ SSLCommerz Error:', apiResponse?.failedreason);
                    res.status(500).send({
                        error: apiResponse?.failedreason || 'Payment initiation failed',
                        details: apiResponse
                    });
                }

            } catch (error) {
                console.error("❌ Server Error:", error);
                res.status(500).send({
                    error: error.message,
                    stack: error.stack
                });
            }
        });

        app.post('/payment/success/:tranID', async (req, res) => {
            try {
                const tranID = req.params.tranID;
                console.log('✅ Payment Success for Tran ID:', tranID);
                const paymentResult = await PayCollection.updateOne(
                    { transitionId: tranID },
                    {
                        $set: {
                            paidStatus: true,
                            updatedAt: new Date()
                        }
                    }
                );

                const payment = await PayCollection.findOne({ transitionId: tranID });

                if (payment && payment.payment && payment.payment.products) {
                    const { email, products } = payment.payment;

                    for (const product of products) {
                        await BuyCollection.updateMany(
                            {
                                email: email,
                                foodId: product.foodId,
                                status: 'pending'  
                            },
                            {
                                $set: {
                                    status: 'Delivered',
                                    transactionId: tranID,
                                    paymentDate: new Date()
                                }
                            }
                        );
                    }

                    console.log(`✅ Updated ${products.length} orders to Delivered`);
                }

                // 4. Frontend-এ redirect
                res.redirect(`http://localhost:5173/dashboard/payment/success/${tranID}`);

            } catch (error) {
                console.error("❌ Success Callback Error:", error);
                res.redirect('http://localhost:5173/payment/fail');
            }
        });

     
        app.post('/payment/fail/:tranID', async(req, res) => {
           const result =await PayCollection.deleteOne({transitionId:req.params.tranID})
           if(result.deletedCount){
               res.redirect(`http://localhost:5173/p/dashboard/payment/fail/${req.params.tranID}`);
           }
        });

      
       
        app.get('/payment/history/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const payments = await PayCollection.find({
                    'payment.email': email,
                    paidStatus: true
                }).sort({ createdAt: -1 }).toArray();

                console.log(`📊 Found ${payments.length} payments in PayCollection`);
                const deliveredOrders = await BuyCollection.find({
                    email: email,
                    status: 'Delivered'
                }).toArray();

                console.log(`📦 Found ${deliveredOrders.length} delivered orders`);

            
                const response = {
                    payments: payments,           
                    orders: deliveredOrders,      
                    totalSpent: deliveredOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0),
                    totalOrders: deliveredOrders.length
                };

                res.send(response);

            } catch (error) {
                console.error("❌ Error fetching payment history:", error);
                res.status(500).send({ error: error.message });
            }
        });
      

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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