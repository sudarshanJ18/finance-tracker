import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased from 5000
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  // Add these for better SSL handling
  family: 4, // Use IPv4, skip trying IPv6
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const connectToDatabase = async (): Promise<MongoClient> => {
  try {
    const client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log('MongoDB connected successfully');
    
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = connectToDatabase();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = connectToDatabase();
}

export default clientPromise;