const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

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
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error.message);
  process.exit(1);
}

const db = getFirestore();

async function migrateInterviews() {
  console.log("Migrating 'interviews' collection...");
  const snapshot = await db.collection('interviews').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.userId && !data.interviewUserId) {
      await doc.ref.update({
        interviewUserId: data.userId,
        userId: FieldValue.delete()
      });
      console.log(`Updated interview document: ${doc.id}`);
      count++;
    }
  }
  console.log(`Finished migrating ${count} interview documents.\n`);
}

async function migrateFeedback() {
  console.log("Migrating 'feedback' collection...");
  const snapshot = await db.collection('feedback').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    let needsUpdate = false;

    if (data.userId && !data.feedbackUserId) {
      updates.feedbackUserId = data.userId;
      updates.userId = FieldValue.delete();
      needsUpdate = true;
    }
    
    if (data.interviewId && !data.feedbackInterviewId) {
      updates.feedbackInterviewId = data.interviewId;
      updates.interviewId = FieldValue.delete();
      needsUpdate = true;
    }

    if (needsUpdate) {
      await doc.ref.update(updates);
      console.log(`Updated feedback document: ${doc.id}`);
      count++;
    }
  }
  console.log(`Finished migrating ${count} feedback documents.\n`);
}

async function main() {
  try {
    await migrateInterviews();
    await migrateFeedback();
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
