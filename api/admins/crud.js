import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { HttpError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.USER_COLLECTION;



// POST - Login admin
export async function loginAdmin(username, password) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Attempting login for username:", username);
  
  try {
    const admin = await collection.findOne({ username: username });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) {
        console.log("Login successful for username:", username);
        
        // Generate JWT token
        const token = jwt.sign(
          { id: admin._id, email: admin.email, username: admin.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return { success: true, token: token, admin: { id: admin._id, email: admin.email, username: admin.username } };
      } else {
        console.log("Login failed for username not matched:", username);
        // Throw HttpError for password mismatch
        throw new HttpError("Invalid username or password", 401); 
      }
    } else {
      console.log("Login failed for username:", username);
      // Throw HttpError for password mismatch
        throw new HttpError("Invalid username or password", 401); 
    }
  } catch (err) {
    if (err instanceof HttpError) {
      // If it's an HttpError we intentionally threw (like the 401 above), re-throw it directly
      throw err;
    } else {
      // If it's any other unexpected error (e.g., database connection issue), 
    // log it and wrap it in a 500 HttpError
    logger.error(`Error during admin login for ${username}: ${err.message}`, { stack: err.stack });
    throw new HttpError("Internal server error during login.", 500); //Wrap unknown errors
    }
  }
}


export async function getAdminByUsername(username) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  console.log("Fetching administrator with username:", username);
  
  try {
    const admin = await collection.findOne({ username: username });
    if (admin) {
      console.log("Administrator found:", admin);
    } else {
      console.log("No administrator found with username:", username);
    }
    return admin;
  } catch (err) {
    console.error("Error retrieving administrator:", err);
    throw err;
  }
}

export async function findAdminByEmail(email) {
  const database = client.db(DB_NAME);
  const collection = database.collection(COLLECTION_NAME);
  return await collection.findOne({ email: email });
}