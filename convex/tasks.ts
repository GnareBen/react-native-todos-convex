import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) throw new Error("Not authorized");
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", auth.subject))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, { title, description, dueDate, priority }) => {
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) throw new Error("Not authorized");

    await ctx.db.insert("tasks", {
      title,
      description,
      dueDate,
      priority,
      completed: false,
      userId: auth.subject,
      createdAt: Date.now(),
    });
  },
});

export const toggleComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(id, { completed: !task.completed });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, { id, title, description, dueDate, priority }) => {
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(id, { title, description, dueDate, priority });
  },
});
