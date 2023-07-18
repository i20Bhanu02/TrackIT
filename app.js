require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltrounds = 5;
var coins = [];
var wishcoins = [];
var curruser = "guest";
var currency = "USD";
var singlecoin;
var coincode;
var sign = "$";
var type = "rank";
var quant = 50;
var coinmap = [];
const PORT = process.env.PORT;

// for local access
// mongoose.connect("mongodb://127.0.0.1:27017/userDB");

// for Mongo Atlas

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.URI);
    } catch (err){
        console.log("failed" + err.message);
    }
}
connectDB();

const app=express();
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");
app.use(express.static("public"));

const userSchema = {
    email : String,
    password : String,
};
const User = new mongoose.model("User",userSchema);

const wishlistSchema = {
    email : String,
    coinlist : Array,
};
const Wishlist = new mongoose.model("Wishlist",wishlistSchema);


async function getresponce(type,quant){

    quant = Number(quant);
    var odr = "descending"
    if(type == "rank") odr = "ascending";
    const api_req_body = {
        currency: currency,
        sort: type,
        order: odr,
        offset: 0,
        limit: quant,
        meta: true,
    };

    const res = await fetch(new Request("https://api.livecoinwatch.com/coins/list"), { 
        method: "POST",
        headers: new Headers({
            "content-type": "application/json",
            "x-api-key": process.env.APIKEY,
        }),
        body: JSON.stringify(api_req_body),
        });
    coins = await res.json();
}

async function getwishlist(coinmap){

    const res = await fetch(new Request("https://api.livecoinwatch.com/coins/map"), {
        method: "POST",
        headers: new Headers({
          "content-type": "application/json",
          "x-api-key": process.env.APIKEY,
        }),
        body: JSON.stringify({
          codes: coinmap,
          currency: currency,
          sort: "rank",
          order: "ascending",
          offset: 0,
          limit: 0,
          meta: true,
        }),
      });
    wishcoins = await res.json();
}

async function getsinglecoin(code){
    const res = await fetch(new Request("https://api.livecoinwatch.com/coins/single"), {
        method: "POST",
        headers: new Headers({
          "content-type": "application/json",
          "x-api-key": process.env.APIKEY,
        }),
        body: JSON.stringify({
          code: code,
          currency: currency,
          meta: true,
        }),
      }) 
    singlecoin = await res.json();
}

app.get("/",(req,res)=>{
    res.render("home");
})

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/dashboard",async(req,res)=>{
    await getresponce(type,quant);
    res.render("dashboard",{coins:coins,curr:currency,sign:sign,wishcodes : coinmap});
})

app.get("/wishlist",async (req,res)=>{

    if(curruser == "guest") res.render("error",{text : "Please login to access Watchlist"});
    else{
        await getwishlist(coinmap);
        res.render("wishlist",{coins:wishcoins,sign:sign,curr:currency});
    }
    
})

app.get("/searchquery",async(req,res)=>{
    await getsinglecoin(coincode);
    if(singlecoin.hasOwnProperty("error")) res.render("error",{text : singlecoin.error.description});
    else res.render("singlecoin",{coin : singlecoin, code:coincode,sign:sign,wishcodes:coinmap,curr:currency});
})

app.post("/",(req,res)=>{
    res.send("success");
})

app.post("/addtowishlistdash",(req,res)=>{
    if(!coinmap.includes(req.body.code)){
        Wishlist.updateOne({email:curruser},{ $addToSet: { coinlist: req.body.code }}).catch((err)=>{
            console.log(err);
        });
        coinmap.push(req.body.code);
    }
    res.redirect("/dashboard");
})

app.post("/addtowishlistsingle",(req,res)=>{
    if(!coinmap.includes(req.body.code)){
        Wishlist.updateOne({email:curruser},{ $addToSet: { coinlist: req.body.code }}).catch((err)=>{
            console.log(err);
        });
        coinmap.push(req.body.code);
    }
    res.redirect("/searchquery");
})

app.post("/deletefromwishlist",(req,res)=>{
    Wishlist.updateOne({email:curruser},{ $pull: { coinlist: req.body.code }}).catch((err)=>{
        console.log(err);
    });
    const idx = coinmap.indexOf(req.body.code);
    coinmap.splice(idx,1);
    res.redirect("/wishlist");
})

app.post("/deletefromwishlistsingle",(req,res)=>{
    Wishlist.updateOne({email:curruser},{ $pull: { coinlist: req.body.code }}).catch((err)=>{
        console.log(err);
    });
    const idx = coinmap.indexOf(req.body.code);
    coinmap.splice(idx,1);
    res.redirect("/searchquery");
})

app.post("/deletefromwishlistdash",(req,res)=>{
    Wishlist.updateOne({email:curruser},{ $pull: { coinlist: req.body.code }}).catch((err)=>{
        console.log(err);
    });
    const idx = coinmap.indexOf(req.body.code);
    coinmap.splice(idx,1);
    res.redirect("/dashboard");
})

app.post("/register",(req,res)=>{
    bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
        if(err) console.log(err);
        else{
            const newuser = new User({
                email : req.body.username,
                password : hash,
            });
        
            newuser.save().then(() =>{

                const userlist = new Wishlist({
                    email : req.body.username,
                    usercoin : [],
                });
                userlist.save();

                curruser = req.body.username;
                res.redirect("/dashboard");
            }).catch((err)=>{
                console.log(err);
            });
        }
    });
})

app.post("/login",(req,res)=>{
    User.findOne({email : req.body.username}).then((found)=>{
        if(found){
            bcrypt.compare(req.body.password, found.password, function(err, result) {
                curruser = req.body.username;
                if(result) {
                    Wishlist.findOne({email : curruser}).then(async (found)=>{
                        if(found) coinmap = found.coinlist;
                    }).catch((err)=>{
                        console.log(err);
                    })

                    res.redirect("/dashboard");
                }
                else res.render("error",{text:"Invalid Password"});
            });
        }
        else res.render("error",{text:"Username doesnot exist, please register"});
    }).catch((err)=>{
        console.log(err);
    })
})

app.post("/currency",async(req,res)=>{
    currency = req.body.setcurr;
    if(currency=="USD") sign="$";
    else sign = "₹";
    await getresponce("rank",50)
    res.redirect("/dashboard");
})

app.post("/coinlist",async (req,res)=>{
    type = req.body.type;
    quant = req.body.quant;
    res.redirect("/dashboard");
})


app.post("/singlesearch",async(req,res)=>{
    coincode = req.body.code;
    coincode = coincode.toUpperCase();
    res.redirect("/searchquery");
})

app.listen(PORT,()=>{
    console.log("server started succesfully!");
})
