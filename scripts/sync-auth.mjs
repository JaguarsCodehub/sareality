import admin from "firebase-admin";
import fs from "fs";

const serviceAccountPath = "./docs/sa-crm-a79ce-firebase-adminsdk-fbsvc-ccb4e5a21d.json";
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const MIGRATIONS = [
    { oldEmail: "emily@sareality.com", newEmail: "anjali@sareality.com", newName: "Anjali Gupta", role: "agent" },
    { oldEmail: "michael@sareality.com", newEmail: "vikram@sareality.com", newName: "Vikram Singh", role: "team_leader" },
    { oldEmail: "david@sareality.com", newEmail: "rohan@sareality.com", newName: "Rohan Mehta", role: "agent" },
    { oldEmail: "sarah@sareality.com", newEmail: "priya@sareality.com", newName: "Priya Sharma", role: "agent" },
];

const DEFAULT_PASSWORD = "Reality@123";

async function bootstrapUsers() {
    console.log("🚀 Starting Bootstrapping & Synchronization...");

    try {
        for (const m of MIGRATIONS) {
            console.log(`\n📦 Processing: ${m.newName} (${m.newEmail})`);

            let authUser;
            try {
                // Check if user already exists in Auth by either email
                try {
                    authUser = await auth.getUserByEmail(m.newEmail);
                    console.log(`   ✅ User already exists in Auth with new email (UID: ${authUser.uid})`);
                } catch (e) {
                    authUser = await auth.getUserByEmail(m.oldEmail);
                    console.log(`   🔄 User exists in Auth with old email. Updating to ${m.newEmail}...`);
                    await auth.updateUser(authUser.uid, { email: m.newEmail, displayName: m.newName });
                    console.log("   ✅ Auth email updated.");
                }
            } catch (e) {
                console.log(`   ➕ User not found in Auth. Creating new account...`);
                authUser = await auth.createUser({
                    email: m.newEmail,
                    password: DEFAULT_PASSWORD,
                    displayName: m.newName,
                    emailVerified: true
                });
                console.log(`   ✅ Created User in Auth (UID: ${authUser.uid})`);
            }

            // Update Firestore
            const uid = authUser.uid;
            const usersCol = db.collection("users");

            // Check if a doc exists with this UID
            const docByUid = await usersCol.doc(uid).get();
            if (docByUid.exists) {
                console.log(`   📝 Updating Firestore profile for UID: ${uid}`);
                await usersCol.doc(uid).update({
                    name: m.newName,
                    email: m.newEmail,
                    role: m.role,
                    isActive: true
                });
            } else {
                // Check if a doc exists with the old email or name that we should "take over"
                const existingDocs = await usersCol.where("email", "in", [m.oldEmail, m.newEmail]).get();
                if (!existingDocs.empty) {
                    const oldDoc = existingDocs.docs[0];
                    console.log(`   📝 Migrating existing Firestore doc (${oldDoc.id}) to UID: ${uid}`);
                    await usersCol.doc(uid).set({
                        ...oldDoc.data(),
                        name: m.newName,
                        email: m.newEmail,
                        role: m.role,
                        isActive: true
                    });
                    if (oldDoc.id !== uid) {
                        await usersCol.doc(oldDoc.id).delete();
                        console.log(`   🗑️ Deleted old Firestore doc: ${oldDoc.id}`);
                    }
                } else {
                    console.log(`   ➕ Creating new Firestore profile for UID: ${uid}`);
                    await usersCol.doc(uid).set({
                        name: m.newName,
                        email: m.newEmail,
                        role: m.role,
                        isActive: true,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            console.log(`   ✨ Done!`);
        }

        console.log("\n🏁 Bootstrapping completed successfully!");
        console.log(`🔑 Default Password for all accounts: ${DEFAULT_PASSWORD}`);
    } catch (error) {
        console.error("\n❌ Critical error:", error);
    } finally {
        process.exit(0);
    }
}

bootstrapUsers();
