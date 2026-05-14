import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gameState: defineTable({
    health: v.number(),
    sanity: v.number(),
    resources: v.number(),
    shadow: v.number(),
    location: v.string(), // "bunker" or "hunt"
    day: v.number(),
    currentEncounterId: v.optional(v.string()),
    inventory: v.array(v.string()),
  }),
  encounters: defineTable({
    text: v.string(),
    leftOption: v.object({
      text: v.string(),
      effects: v.object({
        health: v.number(),
        sanity: v.number(),
        resources: v.number(),
        shadow: v.number(),
      }),
      targetLocation: v.optional(v.string()),
      itemGained: v.optional(v.string()),
      itemRequired: v.optional(v.string()),
    }),
    rightOption: v.object({
      text: v.string(),
      effects: v.object({
        health: v.number(),
        sanity: v.number(),
        resources: v.number(),
        shadow: v.number(),
      }),
      targetLocation: v.optional(v.string()),
      itemGained: v.optional(v.string()),
      itemRequired: v.optional(v.string()),
    }),
    type: v.string(), // "hunt", "bunker", "random"
  }),
  inventory: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(), // "tool", "trophy", "scrap"
  }),
  upgrades: defineTable({
    name: v.string(),
    level: v.number(),
    description: v.string(),
    cost: v.number(),
  }),
  contacts: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(), // "intel", "merchant", "backup"
    status: v.string(), // "available", "busy", "locked"
    cost: v.number(),
  }),
  messages: defineTable({
    from: v.string(),
    text: v.string(),
    read: v.boolean(),
    type: v.string(), // "request", "hint", "flavor"
  }),
});
