import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.OFFICIALS_COLLECTION;

// CREATE - Insert a new official
export async function createOfficial(officialData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const official = {
      name: officialData.name,
      position: officialData.position,
      contact_number: officialData.contact_number,
      email: officialData.email,
      location: officialData.location,
      key_responsibility: officialData.key_responsibility,
      image_url: officialData.image_url,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await collection.insertOne(official);
    console.log("Official created with ID:", result.insertedId);

    // Return the full object including the new MongoDB _id 
    // so the frontend can render the image and handle future updates
    return { _id: result.insertedId, ...official };
  } catch (err) {
    console.error("Error creating official:", err);
    throw err;
  }
}

// READ - Get all officials
export async function getAllOfficials(filter = {}) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Fetching officials with filter:", filter);
  
  try {
    const officials = await collection.find({ ...filter }).toArray();
    console.log(`Retrieved ${officials.length} officials`);


    return officials;
  } catch (err) {
    console.error("Error retrieving officials:", err);
    throw err;
  }
}

// UPDATE - Update an official
export async function updateOfficial(id, updateData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    updateData.updated_at = new Date().toISOString();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    console.log("Official updated:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error updating official:", err);
    throw err;
  }
}


// DELETE - Delete an official
export async function deleteOfficial(id) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    // Soft delete by setting is_deleted to true
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_deleted: true } }
    );
    console.log("Official soft deleted:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error deleting official:", err);
    throw err;
  }
}
