const yaml = require('js-yaml');
const { MongoClient } = require('mongodb');

require('dotenv').config();

module.exports = async function fetchAPIDocs(service) {
    const client = new MongoClient("mongodb+srv://gycoding:iggycoding-05@fallofthegods.zsllqn9.mongodb.net/");
    
    try {
        await client.connect();
        
        const db = client.db("APIGateway");
        const collection = db.collection("APIDocs");
    
        const docs = await collection.find({ service }).toArray();
        return docs;
    } catch(error) {
        console.error("Error fetching API docs: ", error);
        throw error;
    } finally {
        await client.close();
    }
}