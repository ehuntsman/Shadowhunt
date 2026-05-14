import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gameState: defineTable({
    // Narrative Stats
    trust: v.number(),
    reputation: v.number(),
    stress: v.number(),
    money: v.number(),
    injury: v.number(),
    authority: v.number(), // Attention from authorities
    knowledge: v.number(),
    
    currentLocation: v.string(),
    currentSceneId: v.string(),
    day: v.number(),
    inventory: v.array(v.string()),
    clues: v.array(v.string()),
    history: v.array(v.string()), // IDs of scenes visited
  }),

  scenes: defineTable({
    sceneId: v.string(),
    title: v.string(),
    text: v.string(),
    type: v.string(), // "investigation", "travel", "dialogue"
    location: v.string(),
    backgroundImage: v.optional(v.string()),
    choices: v.array(v.object({
      text: v.string(),
      effects: v.object({
        trust: v.optional(v.number()),
        reputation: v.optional(v.number()),
        stress: v.optional(v.number()),
        money: v.optional(v.number()),
        injury: v.optional(v.number()),
        authority: v.optional(v.number()),
        knowledge: v.optional(v.number()),
      }),
      nextSceneId: v.string(),
      itemRequired: v.optional(v.string()),
      itemGained: v.optional(v.string()),
      clueGained: v.optional(v.string()),
      condition: v.optional(v.object({
        stat: v.string(),
        value: v.number(),
        operator: v.string(), // "gt", "lt", "eq"
      })),
    })),
  }).index("by_sceneId", ["sceneId"]),

  contacts: defineTable({
    name: v.string(),
    role: v.string(),
    description: v.string(),
    type: v.string(), // "intel", "professional", "local"
    status: v.string(), 
    cost: v.number(),
  }),

  messages: defineTable({
    from: v.string(),
    text: v.string(),
    read: v.boolean(),
    type: v.optional(v.string()), // "request", "hint", "flavor"
    timestamp: v.number(),
  }),
});
