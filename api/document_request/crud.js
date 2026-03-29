import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.DOCUMENT_REQUEST_COLLECTION;

// CREATE - Insert a new document request
export async function createDocumentRequest(documentRequestData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const documentRequest = {
      request_id: documentRequestData.request_id,
      status: documentRequestData.status, // Pending / Processing / Completed
      document: documentRequestData.document,

      applicant: {
        name: documentRequestData.applicant.name,
        contact: documentRequestData.applicant.contact,
        email: documentRequestData.applicant.email,
      },

      purpose: documentRequestData.purpose,
      date_requested: new Date().toISOString(),
      expected_completion: documentRequestData.expected_completion,
      timeline: documentRequestData.timeline,
    };

    const result = await collection.insertOne(documentRequest);
    console.log("Document request created with ID:", result.insertedId);
    return result;
  } catch (err) {
    console.error("Error creating document request:", err);
    throw err;
  }
}

// READ - Get all document requests
export async function getAllDocumentRequests(filter = {}) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Fetching document requests with filter:", filter);
  
  try {
    const documentRequests = await collection.find({ ...filter }).toArray();
    console.log(`Retrieved ${documentRequests.length} document requests`);
    return documentRequests;
  } catch (err) {
    console.error("Error retrieving document requests:", err);
    throw err;
  }
}

// READ - Get one document request
export async function getDocumentRequestBySearch(search) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Fetching document request with search:", search);

  try {
    const documentRequest = await collection.findOne({
      $or: [
        { request_id: { $regex: `^${search}$`, $options: "i" } },
        { "applicant.name": { $regex: search, $options: "i" } },
        { "applicant.email": { $regex: `^${search}$`, $options: "i" } }
      ]
    });

    console.log("Retrieved document request:", documentRequest);
    return documentRequest;
  } catch (err) {
    console.error("Error retrieving document request:", err);
    throw err;
  }
}

// UPDATE - Update an document request
export async function updateDocumentRequest(id, updateData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    updateData.updated_at = new Date().toISOString();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    console.log("Document request updated:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error updating document request:", err);
    throw err;
  }
}

// PATCH - Update timeline
export async function updateTimeline(id, { timeline }) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log(timeline, typeof timeline);
  
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { timeline: timeline, updated_at: new Date().toISOString() } }
    );

    console.log("Document request timeline updated:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error updating document request timeline:", err);
    throw err;
  }
}

// PATCH - Update status
export async function updateStatus(id, { status }) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status, updated_at: new Date().toISOString() }, 
        $push: {
          timeline: {
            step: status,
            date: new Date(),
            status: "Completed"
          }
        } 
      }
    );

    console.log("Document request status updated:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error updating document request status:", err);
    throw err;
  }
}