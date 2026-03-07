import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Import S3Client and PutObjectCommand
import dotenv from 'dotenv';

dotenv.config();

// Initialize the S3 client with v3 syntax
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export const uploadToS3 = async (file) => {
  if (!file) return null;

  const key = `officials/${Date.now()}-${file.originalname}`; // Define key outside of params for URL construction

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key, // Use the defined key
    Body: file.buffer,
    ContentType: file.mimetype
    // Note: ACL is generally not used in v3 with "Bucket owner preferred" object ownership
    // Access is managed by bucket policies now.
  };

  try {
    // Create a PutObjectCommand and send it using the s3Client
    const command = new PutObjectCommand(params);
    await s3Client.send(command); // Await the command execution

    // Construct the URL manually as result.Location is not directly returned by PutObjectCommand
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    return imageUrl;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw new Error('Failed to upload image to S3');
  }
};