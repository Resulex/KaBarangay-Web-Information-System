import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = "mongodb+srv://dev-user1:NsDXtHtpEsAGNUcd@kabarangay-system-db.qkeqxvv.mongodb.net/?appName=Kabarangay-system-db";

const client = new MongoClient(uri);
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.ANNOUNCEMENT_COLLECTION;

// CREATE - Insert a new announcement
export async function createAnnouncement(announcementData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const announcement = {
      title: announcementData.title,
      priority: announcementData.priority, // low/medium/high
      date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }).toString(),
      is_hidden: false,
      description: announcementData.description,
    };

    const result = await collection.insertOne(announcement);
    console.log("Announcement created with ID:", result.insertedId);
    return result;
  } catch (err) {
    console.error("Error creating announcement:", err);
    throw err;
  }
}

// READ - Get all announcements
export async function getAllAnnouncements(filter = {}) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Fetching announcements with filter:", filter);
  
  try {
    const announcements = await collection.find({ ...filter }).toArray();
    console.log(`Retrieved ${announcements.length} announcements`);
    return announcements;
  } catch (err) {
    console.error("Error retrieving announcements:", err);
    throw err;
  }
}

// UPDATE - Update an announcement
export async function updateAnnouncement(id, updateData) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    updateData.updated_at = new Date().toISOString();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    console.log("Announcement updated:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error updating announcement:", err);
    throw err;
  }
}

// PATCH - Toggle hidden status
export async function toggleHidden(id, { is_hidden }) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_hidden: is_hidden, updated_at: new Date().toISOString() } }
    );

    console.log("Announcement hidden status toggled:", result.modifiedCount, "document(s) modified");
    return result;
  } catch (err) {
    console.error("Error toggling hidden status:", err);
    throw err;
  }
}

// DELETE - Delete an announcement
export async function deleteAnnouncement(id) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    console.log("Announcement deleted:", result.deletedCount, "document(s) deleted");
    return result;
  } catch (err) {
    console.error("Error deleting announcement:", err);
    throw err;
  }
}
