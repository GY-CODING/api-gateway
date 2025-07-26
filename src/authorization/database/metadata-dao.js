const yaml = require('js-yaml');
const { MongoClient } = require('mongodb');

require('dotenv').config();

async function fetchMetadataByUserId(userID) {
    const client = new MongoClient("mongodb+srv://gycoding:iggycoding-05@fallofthegods.zsllqn9.mongodb.net/");
    
    try {
        await client.connect();
        
        const db = client.db("GYAccounts");
        const collection = db.collection("Metadata");
    
        const metadata = await collection.find({ userId: userID }).toArray();
        return metadata;
    } catch(error) {
        console.error("Error fetching Metadata: ", error);
        throw error;
    } finally {
        await client.close();
    }
}

async function fetchMetadataByApiKey(apiKey) {
    const client = new MongoClient("mongodb+srv://gycoding:iggycoding-05@fallofthegods.zsllqn9.mongodb.net/");
    
    try {
        await client.connect();
        
        const db = client.db("GYAccounts");
        const collection = db.collection("Metadata");
    
        const metadata = await collection.find({ "profile.apiKey": apiKey }).toArray();
        return metadata;
    } catch(error) {
        console.error("Error fetching Metadata: ", error);
        throw error;
    } finally {
        await client.close();
    }
}

module.exports = {
    fetchMetadataByUserId,
    fetchMetadataByApiKey
}