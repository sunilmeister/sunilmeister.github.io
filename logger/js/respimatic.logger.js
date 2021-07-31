const datasource_name = "RESPIMATIC100";
const cookie_name = "respimatic_uid";
const respimatic_uid =  sessionStorage.getItem(cookie_name);
document.title = respimatic_uid + " (LOGGER)"
const mongo_db         = "RespimaticSystems";
const mongo_collection = respimatic_uid ;
const mongo_uri = 'mongodb://localhost:27017/' + mongo_db;

/*
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongo_uri);
const db = client.db(mongo_db);
const collection = db.collection(mongo_collection);

client.connect(function(err) {
  if (err) alert("Could not connect to MONGO server");
});

function createRecord(jsonDoc) {
  collection.insert(jsonDoc, function (err, result) {
    if (err) alert('Error');
    else alert("Record added as " + result[0]._id);
  });
}

*/

function stringify_dweet(d) {
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d,null,". ") ;
}

function process_dweet_content(d) {
  // extract all info from the dweet
  // and then shove it into a database

  created = d.created ;
  sysUid = d.thing ;

  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
  }

}

function wait_for_dweets() {
  dweetio.listen_for(respimatic_uid, function(d) {
    process_dweet_content(d);
    stringify_dweet(d);
  });
}

