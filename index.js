const express = require("express")
const app = express()
const cors = require("cors")
const port = process.env.PORT || 3003
const mongodb = require("mongodb")
const mongoclient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const {
    ObjectID
} = require("bson")
app.use(cors({
    origin: "*"
}))
app.use(express.json())
    /////////////////////////////////////////////
    //authenthicate-User
function authenticate(req, res, next) {
    try {
        if (req.headers.authorization) {
            jwt.verify(req.headers.authorization, "7x~Xd\;x\E\5K!?D", function(error, decoded) {
                if (error) {
                    console.log("error")
                } else {
                    console.log(decoded)
                    req.userid = decoded.id
                    next()
                }
            });
        } else {
            console.log("error")
        }
    } catch (error) {
        console.log("error")
    }
}
//authenthicates-Admin
function authenticates(req, res, next) {
    try {
        if (req.headers.authorization) {
            jwt.verify(req.headers.authorization, "GQtX-?^dA(Y324Ka", function(error, decoded) {
                if (error) {
                    console.log("error")
                } else {
                    console.log(decoded)
                        // req.userid = decoded.id
                    next()
                }
            });
        } else {
            console.log("error22")
        }
    } catch (error) {
        console.log("error33")
    }
}

/////////////////////////////////////////
////////USER
//register
app.post("/register", async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash
        let post = await db.collection("data").insertOne(req.body)
        await client.close
    } catch (error) {}
})

//login
app.post("/login", async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
            //find user
        req.body.userid = req.userid
        let users = await db.collection("data").findOne({
            mail: req.body.mail
        })
        console.log(users)
        if (users) {
            let match = await bcrypt.compareSync(req.body.password, users.password);
            console.log(match)
            if (match) {
                let token = jwt.sign({
                    id: users._id
                }, "7x~Xd\;x\E\5K!?D");
                console.log(token)
                res.json({
                    message: true,
                    token
                })
            } else {
                console.log("no")
            }
        } else {
            console.log("nocorrect")
        }
    } catch (error) {}
})

//book
app.post("/bookings", [authenticate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        req.body.userid = req.userid
        console.log(req.body)
        let postdata = await db.collection("users").insertOne(req.body);
        await client.close()
    } catch (error) {}
})

//bookings
app.get("/booking", [authenticate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let data = await db.collection("users").find({
            userid: req.userid
        }).toArray();
        await client.close()
        res.json(data)
    } catch (error) {}
})

//editdetails
app.get("/editdetails/:id", [authenticate], async function(req, res) {
    try {
        // console.log(req.params.id)
        let client = await mongoclient.connect(url);
        let db = client.db("booking");
        req.body.userid = req.userid
        let get = await db.collection("users").find({
            _id: mongodb.ObjectId(req.params.id)
        }).toArray()
        await client.close();
        // console.log(get)
        res.json(get)
    } catch (error) {
        console.log("err")
    }
})

//implementing edits  
app.put("/edit/:id", [authenticate], async function(req, res) {
    try {
        console.log(req.params.id)
        console.log(req.body.name)
        let client = await mongoclient.connect(url)
        let db = client.db("booking");
        req.body.userid = req.userid
        let put = await db.collection("users").updateOne({
            _id: mongodb.ObjectId(req.params.id)
        }, {
            $set: {
                name: req.body.name,
                brand: req.body.brand,
                model: req.body.model,
                number: req.body.number,
                wash: req.body.wash,
                repair: req.body.repair,
                modeone: req.body.modeone,
                modetwo: req.body.modetwo
            }
        }).toArray()
        await client.close();
    } catch (error) {}
})

//feedback
app.post("/feed", [authenticate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        req.body.userid = req.userid
        let user = await db.collection("users").find({
            number: req.body.number
        }).toArray();
        console.log(user)
        if (user.length != 0) {
            var e = 1;
            let post = await db.collection("admin").insertOne(req.body)
            res.json({
                message: "Thank you for your time",
            })
        } else {
            var e = 0;
            console.log("error44")
            res.json({
                message: "Please enter your plate no. correctly",
            })
        }
        await client.close()
        console.log(e)
    } catch (error) {}
})


/////////////////////////////////////////   
/////////////////////////////////////////
////////ADMIN
//login
var task = [{
    mail: "admin",
    password: "admin"
}]
async function trial() {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(task[0].password, salt);
        task[0].password = hash
        console.log(task[0]);
        let deletedata = await db.collection("adminlogin").deleteMany({});
        let postdata = await db.collection("adminlogin").insertOne(task[0]);
        let getdata = await db.collection("adminlogin").find().toArray();
        res.json(getdata)
        await client.close()
    } catch (error) {}
}
trial();

app.post("/adminlogin", async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        console.log(req.body.mail)
        let users = await db.collection("adminlogin").find({
            mail: req.body.mail
        }).toArray()
        console.log(users)
        if (users) {
            console.log(req.body.password)
            let match = await bcrypt.compareSync(req.body.password, users[0].password)
            console.log(match)
            if (match) {
                let token = jwt.sign({
                    id: users._id
                }, "GQtX-?^dA(Y324Ka");
                console.log(token)
                res.json({
                    message: true,
                    token
                })
            } else {
                console.log("error11")
            }
        } else {
            console.log("error12")
        }
    } catch (error) {}
})

//today booking
app.get("/tb", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("booking");
        let dates = new Date();
        let date = ("0" + dates.getDate()).slice(-2);
        let month = ("0" + (dates.getMonth() + 1)).slice(-2);
        let year = dates.getFullYear();
        let td = (year + "-" + month + "-" + date);
        console.log(dates)
        console.log(td)
        let get = await db.collection("users").find({
            date: td
        }).toArray();
        res.json(get);
        console.log(get);
        await client.close()
    } catch (error) {}
})

//admineditdetails
app.get("/admineditdetails/:id", [authenticates], async function(req, res) {
    try {
        console.log(req.params.id)
        let client = await mongoclient.connect(url);
        let db = client.db("booking");
        let get = await db.collection("users").find({
            _id: mongodb.ObjectId(req.params.id)
        }).toArray()
        console.log(get);
        await client.close();
        // console.log(get)
        res.json(get)
    } catch (error) {
        console.log("err")
    }
})

//implementing edits  
app.put("/adminedit/:id", [authenticates], async function(req, res) {
    try {
        console.log(req.params.id)
        console.log(req.body.name)
        let client = await mongoclient.connect(url)
        let db = client.db("booking");
        req.body.userid = req.userid
        let put = await db.collection("users").updateOne({
            _id: mongodb.ObjectId(req.params.id)
        }, {
            $set: {
                name: req.body.name,
                brand: req.body.brand,
                model: req.body.model,
                number: req.body.number,
                wash: req.body.wash,
                repair: req.body.repair,
                modeone: req.body.modeone,
                modetwo: req.body.modetwo,
                time: req.body.time
            }
        }).toArray()
        await client.close();
    } catch (error) {}
})

//tmrwbookings
app.get("/tmrw", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("booking");
        // let dates = new Date();
        // let date = ("0" + dates.getDate()).slice(-2);
        // let month = ("0" + (dates.getMonth() + 1)).slice(-2);
        // let year = dates.getFullYear();
        // let td = (year + "-" + month + "-" + date);
        // console.log(td)
        let today = new Date();
        let tomorrow = new Date(today)
        let final = tomorrow.setDate(tomorrow.getDate() + 1);
        let date = ("0" + tomorrow.getDate()).slice(-2);
        let month = ("0" + (tomorrow.getMonth() + 1)).slice(-2);
        let year = tomorrow.getFullYear();
        let td = (year + "-" + month + "-" + date);
        let get = await db.collection("users").find({
            date: td
        }).toArray();
        res.json(get);
        console.log(get);
        await client.close()
    } catch (error) {}
})

//Allbookings
app.get("/adminbook", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let get = await db.collection("users").find({}).toArray()
        res.json(get)
        await client.close()
    } catch (error) {}
})

//Find
app.post("/fv", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let user = await db.collection("users").find({
            number: req.body.feed
        }).toArray();
        if (user) {
            console.log(user)
            let deletez = await db.collection("note").deleteMany({});
            let post = await db.collection("note").insertMany(user);
            let get = await db.collection("note").find({}).toArray();
        } else {
            console.log("error-12")
        }
    } catch (error) {}
})

//found   
app.get("/fvs", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let get = await db.collection("note").find({}).toArray()
        res.json(get)
        await client.close()
    } catch (error) {}
})

//allfeedbacks
app.get("/adminfeed", [authenticates], async function(req, res) {
    try {
        let client = await mongoclient.connect(url)
        let db = client.db("booking")
        let get = await db.collection("admin").find({}).toArray();
        res.json(get)
        await client.close()
    } catch (error) {}
})

//delete
app.delete("/delete/:id", async function(req, res) {
    try {
        console.log(req.params.id)
        let client = await mongoclient.connect(url)
        let db = client.db("booking");
        let deletez = await db.collection("users").findOneAndDelete({
            _id: mongodb.ObjectId(req.params.id)
        })
        await client.close();
    } catch (error) {}
})


//////////////////////////////////////////////

///////////////////////////////////////////
app.listen(port, function() {
    console.log(`App is Running in ${port}`);
})