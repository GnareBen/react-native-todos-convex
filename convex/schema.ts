import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
