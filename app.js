//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require("mongoose-encryption"); //no need for MD5
// const md5= require("md5"); // After the bcrypt no need this package
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true, useUnifiedTopology: true});

////The schema is changed to encrypt /////
const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

//////Encryption of Database using secret code/////
///But MD5 hashing method is better, therefore I Commented out//////
/* const secretcode = process.env.SECRET_KEY;
 userSchema.plugin(encrypt, {secret : secretcode, encryptedFields : ["password"]}); */ //can include more field into the array

const User = mongoose.model("User", userSchema);

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/",function(req,res){
    res.render("home");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

app.post("/register",function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err,hash){  // salting and hashing the password.

        const email=req.body.username;
        const pass= hash;

        if(email!="" && pass!="")
        {
            var NewUser=new User({
                email:email,
                password : pass
            });
    
            NewUser.save(function(err){
                if(!err){
                    res.redirect("/");
                }
            });
        }
        else{
            res.redirect("/register");
        }
    })
});

app.post("/login", function(req, res){
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email : username}, function(err, FoundUser){
        if(!err){
            if(FoundUser) 
            {
                bcrypt.compare(password, FoundUser.password, function(err, result) {
                    if(result===true)
                    {
                        res.render("secrets");
                    }
                    else
                    {
                        res.redirect("/login");
                    }
                });
                
            }
            else{
                res.redirect("/login");
            }
        }
        else{
            res.redirect("/");
        }
    })
})