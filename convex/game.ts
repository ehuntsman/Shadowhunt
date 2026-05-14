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
        text: "It's 2 AM. The neon sign of 'Mama's Kitchen' flickers, casting a sickly green glow over the parking lot. Inside, a lone waitress is cleaning the counter. She looks like she's seen a lot, but doesn't talk much to strangers.",
        type: "investigation",
        location: "Oakhaven Outskirts",
        backgroundImage: "diner_exterior", // Placeholder for user to map to assets
        choices: [
          {
            text: "Slip her a $20 for info",
            risk: "Low",
            effects: { money: -20, trust: 15, knowledge: 5 },
            nextSceneId: "gas_station",
            clueGained: "A napkin with 'Route 9, Pump 4' scribbled on it."
          },
          {
            text: "Flash your old Investigator Badge",
            risk: "Medium",
            effects: { authority: 15, reputation: -10, stress: 5 },
            nextSceneId: "gas_station",
          },
          {
            text: "Order coffee and listen in",
            risk: "Low",
            effects: { stress: -5, knowledge: 2, money: -5 },
            nextSceneId: "gas_station"
          }
        ]
      },
      {
        sceneId: "gas_station",
        title: "The Abandoned Station",
        text: "The pumps are rusted shut, and the air smells of old oil and something... metallic. A heavy chain locks the main office, but a side window is cracked open. You hear a scratching sound from inside.",
        type: "exploration",
        location: "Route 9",
        backgroundImage: "gas_station_night",
        choices: [
          {
            text: "Climb through the cracked window",
            risk: "High",
            effects: { injury: 15, stress: 20, knowledge: 25 },
            nextSceneId: "woods_trail",
            itemGained: "Rusted Crowbar"
          },
          {
            text: "Search the dumpster out back",
            risk: "Medium",
            effects: { injury: 5, reputation: -10, knowledge: 10 },
            nextSceneId: "woods_trail",
            clueGained: "A blood-stained work shirt with the name 'Elias'."
          },
          {
            text: "Wait in your car and observe",
            risk: "Low",
            effects: { stress: 10 },
            nextSceneId: "woods_trail"
          }
        ]
      },
      {
        sceneId: "woods_trail",
        title: "The Overgrown Trail",
        text: "The trail leads deep into the Blackwood Forest. The trees here grow at impossible angles. You find a circle of stones blocking the path.",
        type: "encounter",
        location: "Blackwood Forest",
        backgroundImage: "forest_trail",
        choices: [
          {
            text: "Disrupt the stone circle",
            risk: "High",
            effects: { stress: 30, authority: 15, knowledge: 20 },
            nextSceneId: "start",
            itemGained: "Polished Black Stone"
          },
          {
            text: "Use Crowbar to pry a stone loose",
            risk: "Medium",
            effects: { injury: 15, knowledge: 15 },
            nextSceneId: "start",
            itemRequired: "Rusted Crowbar",
            clueGained: "The stones are warm to the touch."
          },
          {
            text: "Leave an offering of money",
            risk: "Low",
            effects: { money: -20, trust: 25, stress: -15 },
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
      knowledge: 10,
      currentLocation: "Oakhaven Outskirts",
      currentSceneId: "start",
      day: 1,
      inventory: ["Flashlight", "Old Wallet"],
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
      knowledge: Math.max(0, state.knowledge + (e.knowledge || 0)),
      currentSceneId: choice.nextSceneId,
      history: [...state.history, choice.nextSceneId],
      day: state.day + (choice.nextSceneId === "start" ? 1 : 0)
    };

    // Calculate Outcome Text for the Log
    const changes = [];
    
    // Hide exact amounts for knowledge and others, but show money/items explicitly
    if (e.money) changes.push(`${e.money > 0 ? '+$' : '-$'}${Math.abs(e.money)}`);
    if (choice.itemGained) changes.push(`+ ${choice.itemGained}`);
    
    // Subtle indicators for others
    if (e.trust) changes.push(e.trust > 0 ? "Trust Gained" : "Trust Lost");
    if (e.knowledge) changes.push("New Insights");
    if (e.stress && e.stress > 0) changes.push("Increased Stress");
    if (e.injury && e.injury > 0) changes.push("Sustained Injury");
    if (choice.clueGained) changes.push(`New Lead`);

    updates.latestOutcome = changes.length > 0 ? changes.join(" • ") : "Proceeded.";

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
