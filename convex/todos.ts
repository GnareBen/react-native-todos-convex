import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) throw new Error("Not authorized");

    return await ctx.db
      .query("todos")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", auth.subject))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, { text, priority }) => {
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) throw new Error("Not authorized");

    return await ctx.db.insert("todos", {
      text,
      priority,
      completed: false,
      createdAt: Date.now(),
      userId: auth.subject,
    });
  },
});

export const toggleComplete = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, { id }) => {
    const todo = await ctx.db.get(id);
    if (!todo) throw new Error("Todo not found");
    await ctx.db.patch(id, { completed: !todo.completed });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const updateText = mutation({
  args: { id: v.id("todos"), text: v.string() },
  handler: async (ctx, { id, text }) => {
    await ctx.db.patch(id, { text });
  },
});

export const updatePriority = mutation({
  args: {
    id: v.id("todos"),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, { id, priority }) => {
    await ctx.db.patch(id, { priority });
  },
});
