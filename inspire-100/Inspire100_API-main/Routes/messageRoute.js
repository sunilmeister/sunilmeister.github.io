const express = require('express');

const routes = express.Router();

const messageContoller = require('../controller/messageController');

routes.post('/create', messageContoller.create);
routes.get('/getall', messageContoller.getAll);
routes.post('/getone', messageContoller.getMessage);
// routes.post('/updatemessage', messageContoller.updateMessage);

module.exports = routes;