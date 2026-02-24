import admin from "firebase-admin";
import fs from "fs";

const serviceAccountPath = "./docs/sa-crm-a79ce-firebase-adminsdk-fbsvc-ccb4e5a21d.json";
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const USERS = [
    { name: "Anjali Gupta", email: "anjali@sareality.com" },
    { name: "Vikram Singh", email: "vikram@sareality.com" },
    { name: "Rohan Mehta", email: "rohan@sareality.com" },
    { name: "Priya Sharma", email: "priya@sareality.com" },
];

const TASK_TEMPLATES = [
    { title: "Follow up with client regarding budget", priority: "high", status: "todo" },
    { title: "Schedule site visit for Prestige Woods", priority: "medium", status: "todo" },
    { title: "Send property brochure via WhatsApp", priority: "low", status: "in-progress" },
    { title: "Review loan documentation", priority: "high", status: "todo" },
    { title: "Initial call to understand requirements", priority: "medium", status: "completed", remark: "Customer is looking for 3BHK in Whitefield." },
];

async function seedTasks() {
    console.log("🚀 Seeding dummy tasks for localized users...");

    try {
        for (const user of USERS) {
            const usersSnapshot = await db.collection("users").where("email", "==", user.email).get();
            if (usersSnapshot.empty) {
                console.log(`⚠️ User ${user.email} not found in Firestore. Skipping...`);
                continue;
            }

            const uid = usersSnapshot.docs[0].id;
            console.log(`\n📦 User: ${user.name} (UID: ${uid})`);

            // Find at least one lead for this agent if it exists
            const leadsSnapshot = await db.collection("leads").where("assignedAgentId", "==", uid).limit(1).get();
            const leadId = !leadsSnapshot.empty ? leadsSnapshot.docs[0].id : null;

            if (!leadId) {
                console.log(`   ⚠️ No leads found for this agent. Linking tasks to null...`);
            }

            for (const template of TASK_TEMPLATES) {
                try {
                    const taskData = {
                        ...template,
                        leadId: leadId,
                        assignedAgentId: uid,
                        assignedAgentName: user.name,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        dueDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)),
                    };

                    await db.collection("tasks").add(taskData);
                    console.log(`   ✅ Task: ${template.title} (Lead: ${leadId})`);
                } catch (taskErr) {
                    console.error(`   ❌ Failed to create task "${template.title}":`, taskErr.message);
                }
            }
        }
        console.log("\n🏁 Task seeding completed successfully!");
    } catch (error) {
        console.error("\n❌ Critical error:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedTasks();
