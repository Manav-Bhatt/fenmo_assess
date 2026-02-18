import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  expenses: defineTable({
    amountInPaise: v.number(), // Always stored as an integer (₹10.50 -> 1050)
    category: v.string(),
    description: v.string(),
    date: v.string(), // Stored as YYYY-MM-DD
    idempotencyKey: v.string(), // The shield against double-submissions
    createdAt: v.number(),
  })
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_date", ["date"]),
});