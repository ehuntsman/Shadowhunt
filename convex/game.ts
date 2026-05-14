import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

export const getGameState = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const state = await ctx.db.query("gameState").first();
    return state || null;
  },
});

export const getCurrentScene = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) return null;
    return await ctx.db.query("scenes")
      .withIndex("by_sceneId", (q) => q.eq("sceneId", state.currentSceneId))
      .first();
  },
});

export const initializeGame = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const existing = await ctx.db.query("gameState").first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Seed initial scenes
    const initialScenes = [
      {
        sceneId: "town_arrival",
        title: "Roadside Stop",
        text: "A small roadside town has reported unusual incidents near the highway. The air is thick with the scent of pine and exhaust.",
        type: "investigation",
        location: "Oakhaven",
        choices: [
          {
            text: "Speak with the clerk",
            effects: { trust: 1, stress: 0 },
            nextSceneId: "clerk_dialogue"
          },
          {
            text: "Investigate the highway",
            effects: { stress: 2, knowledge: 1 },
            nextSceneId: "highway_inspection"
          }
        ]
      },
      {
        sceneId: "clerk_dialogue",
        title: "The Gas Station",
        text: "The clerk eyes your badge with a mix of suspicion and relief. 'You here about the missing freight?'",
        type: "dialogue",
        location: "Oakhaven",
        choices: [
          {
            text: "Ask about the witnesses",
            effects: { reputation: 1, knowledge: 2 },
            nextSceneId: "town_arrival" // Loop for now
          },
          {
            text: "Buy a local map",
            effects: { money: -10 },
            nextSceneId: "town_arrival",
            itemGained: "Local Map"
          }
        ]
      },
      {
        sceneId: "highway_inspection",
        title: "Route 42",
        text: "Deep tire tracks lead off the road and into the brush. Something heavy was dragged here.",
        type: "investigation",
        location: "Oakhaven",
        choices: [
          {
            text: "Follow the tracks",
            effects: { injury: 1, stress: 5 },
            nextSceneId: "town_arrival"
          },
          {
            text: "Return to town",
            effects: { authority: 1 },
            nextSceneId: "town_arrival"
          }
        ]
      }
    ];

    for (const scene of initialScenes) {
      const existingScene = await ctx.db.query("scenes")
        .withIndex("by_sceneId", q => q.eq("sceneId", scene.sceneId))
        .first();
      if (!existingScene) {
        await ctx.db.insert("scenes", scene);
      }
    }

    // Seed initial contacts
    const contacts = [
      { name: "Agent K", role: "Federal Liaison", description: "Provides authority clearance.", type: "professional", status: "available", cost: 50 },
      { name: "Old Ben", role: "Local Witness", description: "Knows the town's history.", type: "local", status: "available", cost: 0 }
    ];
    for (const contact of contacts) {
      const existingContact = await ctx.db.query("contacts").filter(q => q.eq(q.field("name"), contact.name)).first();
      if (!existingContact) await ctx.db.insert("contacts", contact);
    }

    return await ctx.db.insert("gameState", {
      trust: 10,
      reputation: 10,
      stress: 0,
      money: 100,
      injury: 0,
      authority: 0,
      knowledge: 0,
      currentLocation: "Oakhaven",
      currentSceneId: "town_arrival",
      day: 1,
      inventory: [],
      clues: [],
      history: ["town_arrival"],
    });
  },
});

export const makeChoice = mutation({
  args: { 
    choiceIndex: v.number(),
    sceneId: v.string()
  },
  handler: async (ctx: MutationCtx, args) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) throw new Error("Game not initialized");

    const scene = await ctx.db.query("scenes")
      .withIndex("by_sceneId", q => q.eq("sceneId", args.sceneId))
      .first();
    if (!scene) throw new Error("Scene not found");

    const choice = scene.choices[args.choiceIndex];
    if (!choice) throw new Error("Choice not found");

    // Requirement checks
    if (choice.itemRequired && !state.inventory.includes(choice.itemRequired)) {
      throw new Error(`Requires: ${choice.itemRequired}`);
    }

    // Stat logic
    const e = choice.effects;
    const newState = {
      trust: Math.max(0, state.trust + (e.trust || 0)),
      reputation: Math.max(0, state.reputation + (e.reputation || 0)),
      stress: Math.max(0, state.stress + (e.stress || 0)),
      money: Math.max(0, state.money + (e.money || 0)),
      injury: Math.max(0, state.injury + (e.injury || 0)),
      authority: Math.max(0, state.authority + (e.authority || 0)),
      knowledge: Math.max(0, state.knowledge + (e.knowledge || 0)),
      currentSceneId: choice.nextSceneId,
      inventory: [...state.inventory],
      clues: [...state.clues],
      history: [...state.history, choice.nextSceneId],
      day: state.day + 1
    };

    if (choice.itemGained && !newState.inventory.includes(choice.itemGained)) {
      newState.inventory.push(choice.itemGained);
    }
    if (choice.clueGained && !newState.clues.includes(choice.clueGained)) {
      newState.clues.push(choice.clueGained);
    }

    await ctx.db.patch(state._id, newState);
    return newState;
  },
});

export const getUpgrades = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return []; // Future-proofing
  },
});

export const getContacts = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("contacts").collect();
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});
