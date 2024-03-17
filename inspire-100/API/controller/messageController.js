const messageModule = require('../Module/messageModule');
const logger = require('./logger');

module.exports = {
    create: (req, res) => {
        const message = req.body;
        const { UID } = message;
        messageModule.messageCollection.find({ UID: UID})
        .then((data) => {
            if (data.length == 0){
                console.log(req.body)
                return messageModule
                .create(req.body)

                .then((data) => {
                    // logger.messageLogger.log('info','user created succefully - ' + data.UID)
                    return res.send({
                        status: "ok",
                        // msg: "User is created",
                        // data : data
                    });
                })

                .catch((err) => {
                    logger.messageLogger.log('debug','fail to create user')
                    return res.send({ status : "fail to create user", error: err });
                });
            }
            else if(data.length == 1){
                // return res.send({status: "fail - user already exist"});
                // logger.messageLogger.log('debug','Update user invoked')
                console.log(req.body)
                const fields = {
                    content : req.body.content
                }
        
                return messageModule
                    .updateMessage(req.body.UID, fields)
        
                    .then((data) => {
                        return res.send({ status: "updated"});
                        // logger.messageLogger.log('info','User updated succesfully - ' + data);
                    })
        
                    .catch((err) =>{
                        logger.messageLogger.log('debug','fail updated - ' + err);
                        return res.send({ status:"fail to update", error: err});
                    })
            }
                
        })

    },

    getAll: (req, res)=>{
        console.log(req.body)
        return messageModule
            .getALL()

            .then((data) => {
                return res.send(data);
            })

            .catch((err) => {
                return res.send({ status: "fail", error: err });
            })
    },

    updateMessage: (req, res) => {

        console.log(req.body)
        
        const fields = {
            message : req.body.message
        }

        return messageModule
            .updateMessage(req.body.UID, fields)

            .then((data) => {
                return res.send({ status: "updated", updatedmessage : data});
            })

            .catch((err) =>{
                return res.send({ status:"fail to update", error: err});
            })
    },

    getMessage: (req,res)=> {
        return messageModule
            .getMessage(req.body.UID)
            
            .then((data) => {
                console.log(data)
                if(data == null){
                    logger.messageLogger.log('debug','UID not found - ' + req.body.UID)
                    return res.send({ status:"Not found", response: Date()}) 
                }
                
                else{
                    // logger.messageLogger.log('info','UID found - ' + req.body.UID)
                    return res.send({ status:"ok", response: data});
                } 
            })

            .catch((err) => {
                logger.messageLogger.log('debug','fail with database - ' + req.body.UID)
                return res.send({ status: "fail", error: err});
            })
    }
}