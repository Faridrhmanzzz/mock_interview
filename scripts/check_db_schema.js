const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function checkCollection(collectionName) {
  const snapshot = await db.collection(collectionName).limit(1).get();
  if (snapshot.empty) {
    console.log(`\nCollection: ${collectionName} (Kosong)`);
    return;
  }
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  console.log(`\nCollection: ${collectionName}`);
  console.log(`PrimaryKey (ID Dokumen): ${doc.id}`);
  console.log("Atribut yang tersimpan dalam dokumen:");
  Object.keys(data).forEach(key => {
    let type = typeof data[key];
    if (Array.isArray(data[key])) type = 'array';
    console.log(`- ${key} (${type})`);
  });
}

async function main() {
  await checkCollection('users');
  await checkCollection('interviews');
  await checkCollection('feedback');
  process.exit(0);
}

main().catch(console.error);
