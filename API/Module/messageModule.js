const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    UID: String,
    content: Object
},
    { timestamps: true } 
)

const messageCollection = mongoose.model('messages',messageSchema);

module.exports = {
    messageCollection,
    create: (fields)=>{
        const message = new messageCollection(fields)
        return message.save();
    },

    updateMessage: (UID,fields)=> messageCollection.updateOne({UID:UID}, fields),

    getMessage: (UID) => messageCollection.findOne({UID:UID}),

    getALL: () => messageCollection.find()
}