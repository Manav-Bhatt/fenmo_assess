import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Equivalent to GET /expenses
export const get = query({
  args: { 
    category: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    // Fetch all expenses
    let expenses = await ctx.db.query("expenses").order("desc").collect();
    
    // Requirement 4: Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Requirement 3: Filter by category
    if (args.category) {
      expenses = expenses.filter(e => e.category === args.category);
    }

    return expenses;
  },
});

// Equivalent to POST /expenses
export const create = mutation({
  args: {
    amountInPaise: v.number(),
    category: v.string(),
    description: v.string(),
    date: v.string(),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // 🛡️ BACKEND VALIDATION: Strictly prevent negative/zero amounts
    if (args.amountInPaise <= 0) {
      throw new Error("Amount must be a positive number.");
    }

    // 🛡️ IDEMPOTENCY CHECK: Did the user double-click or retry a network request?
    const existing = await ctx.db
      .query("expenses")
      .withIndex("by_idempotencyKey", (q) => q.eq("idempotencyKey", args.idempotencyKey))
      .first();

    // If it exists, silently succeed and return the existing ID to prevent duplicates
    if (existing) {
      return existing._id; 
    }

    // Otherwise, insert the new expense safely
    return await ctx.db.insert("expenses", {
      amountInPaise: args.amountInPaise,
      category: args.category,
      description: args.description,
      date: args.date,
      idempotencyKey: args.idempotencyKey,
      createdAt: Date.now(), // Fulfills the 'created_at' requirement
    });
  },
});