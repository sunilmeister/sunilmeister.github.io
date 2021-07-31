const mongo_user       = "RespimaticUser";
const mongo_pwd        = "RespimaticUser_PARC";
const mongo_cluster    = "Respimatic";
const mongo_db         = "RespimaticSystems";
const mongo_collection = "RSP_28CFE43C4D200184";
const mongo_uri        = "mongodb+srv://" + mongo_user + ":" + mongo_pwd +
                         "@" + mongo_cluster + ".boazc.mongodb.net/" +
                         mongo_db + "?retryWrites=true&w=majority";

const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient(mongo_uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

// Sample database actions
async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
