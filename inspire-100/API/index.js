const express = require('express');

const fs = require('fs');

const cors = require('cors');

const {port} = require("./config");

const messageRoute = require('./Routes/messageRoute')

const app = express();

const db = require("./database");

app.use(cors());

app.use(express.json());

app.use('/message',messageRoute);

app.use('/log', (req, res) => {
    const logFilePath = './messages-debug.log';
  
    // Read the contents of the log file
    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error reading log file');
      } else {
        res.send(data);
      }
    });
  });

app.use('/health',(req, res) => {
    res.send({ status: "OK"})
})

// app.listen(port,() => console.log("service started on port: ", process.env.PORT || port));

const http = require('http');
const httpServer = http.createServer(app);

httpServer.listen(port, ()=>{
  console.log("HTTP server : ", port);
})

const https = require('https');
const options = {
    key: fs.readFileSync('./ssl/server.key'), 
    cert: fs.readFileSync('./ssl/server.crt') 
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(3003, () => {
  console.log("HTTPS service started on port: 3003");
});