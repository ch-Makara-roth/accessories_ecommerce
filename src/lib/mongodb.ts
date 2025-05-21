// src/lib/mongodb.ts
import { MongoClient, ServerApiVersion, type MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  // More specific error message
  throw new Error(
    'CRITICAL: MONGODB_URI environment variable is not defined or not accessible. ' +
    'Please ensure it is correctly set in your .env.local file (e.g., MONGODB_URI="mongodb+srv://user:pass@cluster/dbname?retryWrites=true&w=majority") ' +
    'and that the Next.js development server has been RESTARTED.'
  );
}

// Define options to MongoClient.connect
const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
