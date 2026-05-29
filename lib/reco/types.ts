/**
 * Recommendation-eval types.
 *
 * `Persona` mirrors the shape in `data/reco-personas/personas.json`
 * (documented in `docs/reco-persona-shape.md` + `docs/reco-family-shape.md`).
 * `ExpectedTask` is what the ground-truth rule emits per persona.
 */

export type PriceTier = 'budget' | 'mid' | 'premium';
export type SpiceTolerance = 'mild' | 'medium' | 'hot';
export type DeliveryTimeTolerance = 'quick' | 'flexible';
export type PromoSensitivity = 'low' | 'mid' | 'high';

export type Preferences = {
  cuisine_affinity: Record<string, number>;
  price_tier: PriceTier;
  dietary: string[];
  spice_tolerance: SpiceTolerance;
  novelty_appetite: number;
  delivery_time_tolerance: DeliveryTimeTolerance;
  promo_sensitivity: PromoSensitivity;
};

export type Family = {
  adults: number;
  kids: number;
  kid_ages: number[];
  shared_dietary: string[];
  kid_friendly_required: boolean;
  notes?: string;
};

export type PersonaAddress = {
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  default: boolean;
};

export type Persona = {
  id: string;
  user_id: number;
  display_name: string;
  email: string;
  address: PersonaAddress;
  story: string;
  preferences: Preferences;
  family: Family | null;
};

export type ExpectedSection = {
  label: string;
  cuisine: string;
  ranked_restaurant_ids: number[];
  novelty_index: number;
};

export type ExpectedTask = {
  personaId: string;
  surface: 'home_feed';
  sections: ExpectedSection[];
  blocked_restaurant_ids: number[];
  flat_ranked_ids: number[];
};

export type ExpectedOverride = Partial<Omit<ExpectedTask, 'personaId' | 'surface'>>;

export type TrajectoryStage = 'query' | 'candidate_gen' | 'filter' | 'score' | 'rerank' | 'final';

export type TrajectoryStep = {
  stage: TrajectoryStage;
  restaurant_ids: number[];
  scores?: Record<number, number>;
  notes?: string;
};

export type RecoTrajectory = {
  engine: string;
  steps: TrajectoryStep[];
  raw_explain?: unknown;
};
