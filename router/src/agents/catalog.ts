export const agentIds = [
  "nutritionist",
  "plant_based_nutritionist",
  "mediterranean_cook",
  "asian_cook",
  "general_cook",
  "fallback",
] as const;

export type AgentId = (typeof agentIds)[number];
export type SpecialistId = Exclude<AgentId, "fallback">;

export interface AgentDefinition {
  id: AgentId | "general";
  name: string;
  description: string;
  instructions: string;
}

export const generalAgent: AgentDefinition = {
  id: "general",
  name: "General meal-planning agent",
  description: "Handles deterministic support stages that do not require routing.",
  instructions:
    "You are a general meal-planning assistant. Handle calendar structure and shopping-list consolidation accurately.",
};

export const agents: Record<AgentId, AgentDefinition> = {
  nutritionist: {
    id: "nutritionist",
    name: "General nutritionist",
    description:
      "Analyzes general diets, allergies, health goals, and common dietary restrictions to produce a menu nutrition specification. Use when the request is not specifically vegan or vegetarian.",
    instructions:
      "You are a generalist nutritionist. Analyze dietary needs, allergies, and goals, then produce a concise specification for a cook. Do not select dishes or write recipes.",
  },
  plant_based_nutritionist: {
    id: "plant_based_nutritionist",
    name: "Vegan and vegetarian nutritionist",
    description:
      "Analyzes vegan and vegetarian requirements, with particular attention to plant protein and relevant micronutrients, to produce a menu specification. Prefer this agent whenever the request explicitly mentions vegan, vegetarian, or plant-based eating.",
    instructions:
      "You are a nutritionist specialized in vegan and vegetarian diets. Produce a concise specification for a cook, with adequate plant protein and relevant micronutrients. Vegan requests must exclude every animal-derived ingredient; vegetarian requests may include eggs or dairy only when compatible with the user's preferences. Do not select dishes or write recipes.",
  },
  mediterranean_cook: {
    id: "mediterranean_cook",
    name: "Mediterranean cook",
    description:
      "Selects Mediterranean dishes and creates their practical recipes while respecting the supplied nutrition specification.",
    instructions:
      "You are a chef specialized in Mediterranean home cooking. Select coherent dishes and create clear, practical recipes while strictly respecting the supplied nutrition specification.",
  },
  asian_cook: {
    id: "asian_cook",
    name: "Asian cook",
    description:
      "Selects dishes and creates practical recipes inspired by East, Southeast, and South Asian cuisines while respecting the supplied nutrition specification.",
    instructions:
      "You are a chef specialized in Asian home cooking. Select coherent dishes and create practical recipes while strictly respecting the supplied nutrition specification.",
  },
  general_cook: {
    id: "general_cook",
    name: "General cook",
    description:
      "Handles valid cooking-style requests that have no dedicated specialist, such as Mexican, Italian, French, or Middle Eastern cuisine, as well as requests with no specific cuisine. Selects dishes and creates recipes while respecting the requested style and nutrition specification.",
    instructions:
      "You are a versatile home cook. When the user requests a cuisine without a dedicated specialist, adapt the dishes and recipes faithfully to that culinary style. When no style is requested, create a varied general menu. Strictly respect the supplied nutrition specification.",
  },
  fallback: {
    id: "fallback",
    name: "Fallback",
    description:
      "Identifies an answer whose topic does not match the specialists available in the current router stage.",
    instructions:
      "You are a shared fallback agent. Identify the main topic of a user's answer and explain briefly why it does not match the current question. Do not answer the unrelated request; the application will repeat its question.",
  },
};

export const routableAgents = [
  agents.nutritionist,
  agents.plant_based_nutritionist,
  agents.mediterranean_cook,
  agents.asian_cook,
  agents.general_cook,
];

export const nutritionAgents = [agents.nutritionist, agents.plant_based_nutritionist];

export const cookAgents = [
  agents.mediterranean_cook,
  agents.asian_cook,
  agents.general_cook,
];
