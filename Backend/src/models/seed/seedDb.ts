import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./../User"; // Ensure this path matches your folder structure
import Notification from "./../Notification";

dotenv.config();

// Notification seed data keyed by clerkUserId of the recipient
const notificationSeeds: Array<{
  recipientClerkUserId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  relatedEntityType?: string;
  inAppRead: boolean;
  createdAt: Date;
}> = [
  // --- Logged-in employee (user_3AlAFkcp5mLctZeIPOuBC4NeVK9) ---
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "referral_submitted",
    title: "Your Referral Has Been Submitted",
    message:
      "A referral for Physiotherapy Assessment has been submitted on your behalf for lower back pain. A practitioner will review it shortly and be in touch.",
    priority: "medium",
    relatedEntityType: "referral",
    inAppRead: false,
    createdAt: new Date("2026-03-10T09:15:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "appointment_scheduled",
    title: "Appointment Scheduled with James Wilson",
    message:
      "Your physiotherapy appointment with James Wilson has been confirmed. Please arrive 10 minutes early and bring any relevant medical notes.",
    priority: "medium",
    relatedEntityType: "appointment",
    inAppRead: false,
    createdAt: new Date("2026-03-09T11:30:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "follow_up_required",
    title: "Follow-Up Session Recommended",
    message:
      "Your practitioner has recommended a follow-up session. Please contact your HR manager to arrange your next appointment.",
    priority: "high",
    inAppRead: false,
    createdAt: new Date("2026-03-10T08:00:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "appointment_completed",
    title: "Appointment Completed",
    message:
      "Your physiotherapy session has been marked as complete. Review any follow-up recommendations in your dashboard.",
    priority: "low",
    relatedEntityType: "appointment",
    inAppRead: true,
    createdAt: new Date("2026-03-05T14:00:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "referral_assigned",
    title: "Referral Assigned to Practitioner",
    message:
      "Your occupational health referral has been assigned to a practitioner. You can expect to be contacted within 2 working days to arrange your assessment.",
    priority: "medium",
    relatedEntityType: "referral",
    inAppRead: false,
    createdAt: new Date("2026-03-07T07:45:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "appointment_reminder_24h",
    title: "Appointment Reminder: Tomorrow",
    message:
      "This is a reminder that you have an appointment scheduled for tomorrow. Please make sure you are available at the agreed time.",
    priority: "medium",
    relatedEntityType: "appointment",
    inAppRead: true,
    createdAt: new Date("2026-03-04T10:00:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "outcome_report_ready",
    title: "Outcome Report Available",
    message:
      "Your assessment outcome report is now ready. Please speak with your HR manager to review the recommendations and next steps.",
    priority: "high",
    inAppRead: true,
    createdAt: new Date("2026-02-22T13:00:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "appointment_cancelled",
    title: "Appointment Cancelled",
    message:
      "Your scheduled appointment has been cancelled. Please contact your HR manager or book a new appointment through the dashboard.",
    priority: "high",
    inAppRead: true,
    createdAt: new Date("2026-02-15T09:00:00.000Z"),
  },
  {
    recipientClerkUserId: "user_3AlAFkcp5mLctZeIPOuBC4NeVK9",
    type: "referral_submitted",
    title: "Referral Submitted by Your Manager",
    message:
      "A Mental Health Counselling referral has been submitted on your behalf by your manager. You will be contacted to confirm an appointment time.",
    priority: "medium",
    relatedEntityType: "referral",
    inAppRead: true,
    createdAt: new Date("2026-02-10T09:30:00.000Z"),
  },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear only notifications — users, referrals, and services are preserved
    console.log("🧹 Clearing existing notifications...");
    await Notification.deleteMany({});

    console.log("🔍 Resolving recipient user IDs...");
    const clerkIds = [...new Set(notificationSeeds.map((n) => n.recipientClerkUserId))];
    const users = await User.find({ clerkUserId: { $in: clerkIds } }).select("_id clerkUserId").lean();

    const clerkToMongoId = new Map<string, mongoose.Types.ObjectId>(
      users.map((u) => [u.clerkUserId as string, u._id as mongoose.Types.ObjectId])
    );

    const missingUsers = clerkIds.filter((id) => !clerkToMongoId.has(id));
    if (missingUsers.length > 0) {
      console.warn(`⚠️  No DB record found for clerkUserIds: ${missingUsers.join(", ")}`);
      console.warn("   Make sure users are already seeded before running this script.");
    }

    const notificationDocs = notificationSeeds
      .filter((seed) => clerkToMongoId.has(seed.recipientClerkUserId))
      .map((seed) => ({
        recipientId: clerkToMongoId.get(seed.recipientClerkUserId),
        type: seed.type,
        title: seed.title,
        message: seed.message,
        priority: seed.priority,
        relatedEntityType: seed.relatedEntityType,
        channels: {
          email: { sent: false },
          sms: { sent: false },
          inApp: {
            read: seed.inAppRead,
            readAt: seed.inAppRead ? seed.createdAt : undefined,
          },
        },
        createdAt: seed.createdAt,
        updatedAt: seed.createdAt,
      }));

    console.log(`🌱 Seeding ${notificationDocs.length} notifications...`);
    // Use native driver to preserve custom createdAt/updatedAt dates
    await Notification.collection.insertMany(notificationDocs);

    console.log("✨ Notifications seeded successfully!");

    await mongoose.disconnect();
    console.log("👋 Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding notifications:", error);
    process.exit(1);
  }
};

seedDatabase();