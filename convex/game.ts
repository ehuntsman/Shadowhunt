import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const getGameState = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gameState").first();
  },
});

export const getCurrentScene = query({
  args: {},
  handler: async (ctx) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) return null;
    return await ctx.db
      .query("scenes")
      .withIndex("by_sceneId", (q) => q.eq("sceneId", state.currentSceneId))
      .first();
  },
});

export const getContacts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").collect();
  },
});

export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const initializeGame = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const existing = await ctx.db.query("gameState").first();
    if (existing) await ctx.db.delete(existing._id);
    
    const oldScenes = await ctx.db.query("scenes").collect();
    for (const s of oldScenes) await ctx.db.delete(s._id);

    const scenarios = [
      {
        sceneId: "start",
        title: "The Roadside Diner",
        text: "Mama's Kitchen. The coffee is burnt and the atmosphere is heavy. You feel like the truth is buried somewhere in this grease-stained booth.",
        type: "investigation",
        location: "Oakhaven Outskirts",
        choices: [
          {
            text: "Order coffee and watch the patrons",
            risk: "Low",
            effects: { money: -5, stress: -5, knowledge: 5 },
            nextSceneId: "start",
          },
          {
            text: "Bribe the waitress for local rumors",
            risk: "Low",
            effects: { money: -20, trust: 15, knowledge: 15 },
            nextSceneId: "start",
            clueGained: "Someone saw 'lights' near the old Gas Station."
          },
          {
            text: "Search the payphone for discarded notes",
            risk: "Medium",
            effects: { stress: 5, knowledge: 10 },
            nextSceneId: "start",
            itemGained: "Scribbled Napkin"
          },
          {
            text: "Drive to the Abandoned Gas Station",
            risk: "Low",
            effects: { stress: 5 },
            nextSceneId: "gas_station"
          },
          {
            text: "Confront the shadow in the alley",
            risk: "High",
            effects: { injury: 20, stress: 10, reputation: 10 },
            nextSceneId: "the_encounter",
            itemRequired: "Silver Blade" // Can't do this yet
          }
        ]
      },
      {
        sceneId: "gas_station",
        title: "Abandoned Station",
        text: "Pump 4 is covered in a strange, viscous black fluid. The air is deathly silent. You need to find out what happened here.",
        type: "exploration",
        location: "Route 9",
        choices: [
          {
            text: "Inspect the black fluid on Pump 4",
            risk: "High",
            effects: { injury: 10, stress: 15, knowledge: 25 },
            nextSceneId: "gas_station",
            clueGained: "The fluid is organic... and still warm."
          },
          {
            text: "Search the service bay for tools",
            risk: "Medium",
            effects: { injury: 5, knowledge: 10 },
            nextSceneId: "gas_station",
            itemGained: "Rusted Crowbar"
          },
          {
            text: "Follow the muddy tracks into the woods",
            risk: "High",
            effects: { stress: 10 },
            nextSceneId: "woods_trail"
          }
        ]
      },
      {
        sceneId: "woods_trail",
        title: "Blackwood Trail",
        text: "The deeper you go, the more the trees seem to lean toward you. A circle of stones marks a clearing ahead.",
        type: "encounter",
        location: "Blackwood Forest",
        choices: [
          {
            text: "Examine the carvings on the stones",
            risk: "Medium",
            effects: { stress: 10, knowledge: 20 },
            nextSceneId: "woods_trail",
            clueGained: "Ancient symbols for 'Hunter' and 'Prey'."
          },
          {
            text: "Pry a stone loose with your Crowbar",
            risk: "High",
            effects: { injury: 15, knowledge: 15 },
            nextSceneId: "woods_trail",
            itemRequired: "Rusted Crowbar",
            itemGained: "Silver Blade"
          },
          {
            text: "The creature emerges from the brush",
            risk: "High",
            effects: { injury: 30, stress: 20 },
            nextSceneId: "the_encounter"
          },
          {
            text: "Return to the Diner to regroup",
            risk: "Low",
            effects: { stress: -10 },
            nextSceneId: "start"
          }
        ]
      },
      {
        sceneId: "the_encounter",
        title: "Face to Face",
        text: "It's tall, gaunt, and its skin is the color of bruised plums. This is what's been haunting Oakhaven. It hasn't seen you yet.",
        type: "hunt",
        location: "Unknown",
        choices: [
          {
            text: "Banish it with the Silver Blade",
            risk: "High",
            effects: { knowledge: 100, reputation: 50 },
            nextSceneId: "victory",
            itemRequired: "Silver Blade"
          },
          {
            text: "Try to take a photo (No Weapon)",
            risk: "High",
            effects: { injury: 40, knowledge: 20 },
            nextSceneId: "start"
          }
        ]
      },
      {
        sceneId: "victory",
        title: "The Hunt is Over",
        text: "The creature dissolves into ash. The heavy fog lifting from Oakhaven for the first time in weeks. You've survived the hunt.",
        type: "victory",
        location: "Oakhaven",
        choices: [
          {
            text: "Start a new case",
            risk: "Low",
            effects: {},
            nextSceneId: "start"
          }
        ]
      }
    ];

    for (const scene of scenarios) {
      await ctx.db.insert("scenes", scene);
    }

    return await ctx.db.insert("gameState", {
      trust: 50,
      reputation: 20,
      stress: 10,
      money: 100,
      injury: 0,
      authority: 0,
      knowledge: 0, // 0% Hunt Progress
      currentLocation: "Oakhaven Outskirts",
      currentSceneId: "start",
      day: 1,
      inventory: ["Flashlight"],
      clues: [],
      history: ["start"],
    });
  },
});

export const makeChoice = mutation({
  args: {
    choiceIndex: v.number(),
    sceneId: v.string(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) throw new Error("No game state");

    const scene = await ctx.db
      .query("scenes")
      .withIndex("by_sceneId", (q) => q.eq("sceneId", args.sceneId))
      .first();

    if (!scene) throw new Error("Scene not found");

    const choice = scene.choices[args.choiceIndex];
    if (!choice) throw new Error("Choice not found");

    if (choice.itemRequired && !state.inventory.includes(choice.itemRequired)) {
      throw new Error(`You need the ${choice.itemRequired}.`);
    }

    const e = choice.effects;
    const updates: any = {
      trust: Math.max(0, state.trust + (e.trust || 0)),
      reputation: Math.max(0, state.reputation + (e.reputation || 0)),
      stress: Math.max(0, state.stress + (e.stress || 0)),
      money: Math.max(0, state.money + (e.money || 0)),
      injury: Math.max(0, state.injury + (e.injury || 0)),
      authority: Math.max(0, state.authority + (e.authority || 0)),
      knowledge: Math.min(100, state.knowledge + (e.knowledge || 0)),
    };

    if (choice.nextSceneId !== state.currentSceneId) {
      updates.currentSceneId = choice.nextSceneId;
      updates.history = [...state.history, choice.nextSceneId];
      if (choice.nextSceneId === "start") {
        updates.day = state.day + 1;
      }
    }

    const changes = [];
    if (e.money) changes.push(`${e.money > 0 ? '+$' : '-$'}${Math.abs(e.money)}`);
    if (choice.itemGained) changes.push(`+ ${choice.itemGained}`);
    if (e.knowledge) changes.push("New Insights Found");
    if (e.injury && e.injury > 0) changes.push("Sustained Injury");
    if (choice.clueGained) changes.push(`New Lead Found`);

    updates.latestOutcome = changes.length > 0 ? changes.join(" • ") : "Investigated.";

    if (choice.itemGained) {
      updates.inventory = [...state.inventory, choice.itemGained];
    }

    if (choice.clueGained) {
      updates.clues = [...state.clues, choice.clueGained];
    }

    await ctx.db.patch(state._id, updates);
    return updates;
  },
});
