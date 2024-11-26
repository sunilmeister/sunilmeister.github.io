const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/Ventilator');
// mongoose.connect('mongodb+srv://devilhacker7568:devilhacker7568@cluster0.xx0c52b.mongodb.net/?retryWrites=true&w=majority');


const con = mongoose.connection;

con.on('connected',()=>{
    console.log("Jai Shree Ram");
})

con.on('error',()=>{
    console.log("ERROR: database connection error");
})

con.on('disconnected',()=>{
    console.log("database disconnected");
})

module.exports = con;