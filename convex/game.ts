import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";

export const getGameState = query({
  args: {},
  returns: v.union(v.null(), v.object({
    _id: v.id("gameState"),
    _creationTime: v.number(),
    health: v.number(),
    sanity: v.number(),
    resources: v.number(),
    shadow: v.number(),
    location: v.string(),
    day: v.number(),
    currentEncounterId: v.optional(v.string()),
    inventory: v.array(v.string()),
  })),
  handler: async (ctx: QueryCtx) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) return null;
    return state;
  },
});

async function pickNextEncounter(ctx: MutationCtx, location: string, excludeId?: string) {
  const encounters = await ctx.db.query("encounters").collect();
  const filtered = encounters.filter(e => e.type === location);
  const candidates = filtered.length > 0 ? filtered : encounters;
  
  if (candidates.length === 0) return undefined;
  
  if (candidates.length > 1 && excludeId) {
    const others = candidates.filter(e => e._id !== excludeId);
    return others[Math.floor(Math.random() * others.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const initializeGame = mutation({
  args: {},
  returns: v.id("gameState"),
  handler: async (ctx: MutationCtx) => {
    const existing = await ctx.db.query("gameState").first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    
    // Seed encounters
    const existingEncounters = await ctx.db.query("encounters").collect();
    if (existingEncounters.length === 0) {
      const initialSeeds = [
        {
          text: "You hear a scratching at the bunker door. It sounds... large.",
          type: "bunker",
          leftOption: { text: "Open it with a shotgun", effects: { health: -10, sanity: -5, resources: -5, shadow: -10 } },
          rightOption: { text: "Ignore it and pray", effects: { health: 0, sanity: -15, resources: 0, shadow: 5 } }
        },
        {
          text: "A hunter friend calls. They've found a nest in the city sewer.",
          type: "bunker",
          leftOption: { text: "Let's go", effects: { health: 0, sanity: 0, resources: -10, shadow: -5 }, targetLocation: "hunt" },
          rightOption: { text: "Too dangerous", effects: { health: 0, sanity: 0, resources: 0, shadow: 0 } }
        },
        {
          text: "The hunt is over. You are exhausted but alive.",
          type: "hunt",
          leftOption: { text: "Return to bunker", effects: { health: 10, sanity: 5, resources: 0, shadow: 0 }, targetLocation: "bunker" },
          rightOption: { text: "Stay and scavenge", effects: { health: -10, sanity: -5, resources: 30, shadow: -10 } }
        },
        {
          text: "You find a gleaming silver blade in a hollow tree.",
          type: "hunt",
          leftOption: { text: "Take it", effects: { health: 0, sanity: 0, resources: 0, shadow: -5 }, itemGained: "Silver Blade" },
          rightOption: { text: "Leave it", effects: { health: 0, sanity: 0, resources: 0, shadow: 0 } }
        },
        {
          text: "A Werewolf blocks your path, snarling with yellow eyes.",
          type: "hunt",
          leftOption: { text: "Fight with Silver Blade", effects: { health: -5, sanity: -10, resources: 0, shadow: 5 }, itemRequired: "Silver Blade" },
          rightOption: { text: "Run for your life", effects: { health: -40, sanity: -20, resources: 0, shadow: 0 } }
        }
      ];
      for (const seed of initialSeeds) {
        await ctx.db.insert("encounters", seed as any);
      }
    }

    const nextEncounter = await pickNextEncounter(ctx, "bunker");
    
    const stateId = await ctx.db.insert("gameState", {
      health: 50,
      sanity: 50,
      resources: 50,
      shadow: 50,
      location: "bunker",
      day: 1,
      inventory: [],
      currentEncounterId: nextEncounter?._id,
    });

    const existingUpgrades = await ctx.db.query("upgrades").collect();
    if (existingUpgrades.length === 0) {
      const upgrades = [
        { name: "Reinforced Door", level: 1, description: "Increases Shadow resistance.", cost: 30 },
        { name: "Medical Lab", level: 1, description: "Restores Health over time.", cost: 50 },
        { name: "Psych Ward", level: 1, description: "Restores Sanity over time.", cost: 50 }
      ];
      for (const u of upgrades) {
        await ctx.db.insert("upgrades", u);
      }
    }

    return stateId;
  },
});

export const handleChoice = mutation({
  args: { 
    choice: v.union(v.literal("left"), v.literal("right")),
    encounterId: v.id("encounters")
  },
  returns: v.any(),
  handler: async (ctx: MutationCtx, args) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) throw new Error("Game not initialized");

    const encounter = await ctx.db.get(args.encounterId);
    if (!encounter) throw new Error("Encounter not found");

    const option = args.choice === "left" ? encounter.leftOption : encounter.rightOption;
    const effects = option.effects;
    const targetLocation = (option as any).targetLocation;
    const itemGained = (option as any).itemGained;
    const itemRequired = (option as any).itemRequired;

    if (itemRequired && !state.inventory.includes(itemRequired)) {
      throw new Error(`You need ${itemRequired} to do this!`);
    }

    let newLocation = targetLocation || state.location;
    let newInventory = [...state.inventory];
    
    if (itemGained && !newInventory.includes(itemGained)) {
      newInventory.push(itemGained);
    }
    
    // Auto-retreat from hunt chance
    if (!targetLocation && state.location === "hunt" && Math.random() > 0.8) {
      newLocation = "bunker";
    }

    const nextEncounter = await pickNextEncounter(ctx, newLocation, encounter._id);

    const newState = {
      health: Math.min(100, Math.max(0, state.health + effects.health)),
      sanity: Math.min(100, Math.max(0, state.sanity + effects.sanity)),
      resources: Math.min(100, Math.max(0, state.resources + effects.resources)),
      shadow: Math.min(100, Math.max(0, state.shadow + effects.shadow)),
      day: state.day + 1,
      location: newLocation,
      inventory: newInventory,
      currentEncounterId: nextEncounter?._id,
    };

    await ctx.db.patch(state._id, newState);

    return newState;
  },
});

export const getRandomEncounter = query({
  args: {},
  returns: v.any(),
  handler: async (ctx: QueryCtx) => {
    const state = await ctx.db.query("gameState").first();
    if (!state || !state.currentEncounterId) {
       // Fallback for safety
       const any = await ctx.db.query("encounters").first();
       return any;
    }
    return await ctx.db.get(state.currentEncounterId as any);
  },
});

export const getUpgrades = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx: QueryCtx) => {
    return await ctx.db.query("upgrades").collect();
  },
});

export const buyUpgrade = mutation({
  args: { upgradeId: v.id("upgrades") },
  returns: v.boolean(),
  handler: async (ctx: MutationCtx, args) => {
    const state = await ctx.db.query("gameState").first();
    if (!state) throw new Error("Game not initialized");

    const upgrade = await ctx.db.get(args.upgradeId);
    if (!upgrade) throw new Error("Upgrade not found");

    if (state.resources < upgrade.cost) {
      throw new Error("Not enough resources");
    }

    await ctx.db.patch(state._id, {
      resources: state.resources - upgrade.cost,
    });

    await ctx.db.patch(upgrade._id, {
      level: upgrade.level + 1,
      cost: Math.floor(upgrade.cost * 1.5),
    });

    return true;
  },
});
