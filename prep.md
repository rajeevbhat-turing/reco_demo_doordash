# Demo prep — Dashdoor reco harness

## What it does, in plain terms

You have a Dashdoor user with a goal in mind — *"order mac & cheese from
West Diner"*, *"find me the cheapest Yuzu soda, but not from Seafood
Market"*. The harness asks every recommendation approach the same
question: **given this user and this goal, which restaurant or item
should we surface?**

Then it scores how good each answer was, against the ground truth of
what the user actually would have wanted.

Two flavors of "approach" can answer that question side-by-side:

1. **Ranking-based approaches** — the textbook recsys family. Things
   like *most-popular*, *collaborative filtering*, *matrix
   factorization*. They look at user × item history and produce a
   ranked list. Fast, well-understood, but they only know about items
   and users — they can't read what the goal actually says.

2. **LLM agents** — given the goal as natural language *and* the actual
   Dashdoor app rendered in front of them, the LLM clicks around like a
   person would and ends up at whatever it thinks is the right answer.
   Slower, but it can handle goals the ranking approaches structurally
   can't (multi-step intents, free-form constraints like "but not from
   Seafood Market").

Both flavors get scored with the same ranked-retrieval metrics — Hit@K,
NDCG@K, MRR, Recall@K, and coverage — so you can compare them
apples-to-apples. **That comparison is the point** — it's a benchmark
that lets you ask *"for which kinds of recommendation tasks does an LLM
agent earn its keep over a classical ranker, and where doesn't it?"*

And because we run real engines on a real-looking commerce app with
real tasks, the answer is grounded, not theoretical.

## What the metrics mean

The engine returns a ranked list of K items per task; the task has one
or more ground-truth "right" items. The scores compare the two:

- **Hit@K** — did *any* of the top-K predictions match a ground-truth
  item? Binary per task, averaged across tasks. *"Did you find at least
  one right answer?"* It's the loosest metric — it doesn't care where
  in the list the hit was, only whether it appeared at all.

- **NDCG@K** *(Normalized Discounted Cumulative Gain)* — same as Hit@K
  but rewards ranking the right item higher. A hit at position 1 is
  worth more than a hit at position 5, with a log-discount falloff.
  Normalized so 1.0 = perfect ranking, 0 = no hit. *"How well-ordered
  was your list?"*

- **MRR** *(Mean Reciprocal Rank)* — locates the *first* hit and takes
  `1 / rank`: position 1 → 1.0, position 2 → 0.5, position 3 → 0.33.
  Averaged across tasks. Specifically captures *"how quickly did you
  surface the right answer?"* — useful when users only ever look at
  the top of the list.

- **Recall@K** — of *all* ground-truth items for a task, what fraction
  did the top-K capture? If a task has 3 right items and your top-5
  contains 2 of them, recall = 2/3. *"How much of the answer did you
  cover?"*

- **Coverage** — fraction of the *whole catalog* the engine ever
  surfaces across the full task suite. Not an accuracy metric — a
  diversity proxy. A popularity baseline that always recommends the
  same 10 hot items will score low coverage; a random baseline scores
  high. *"Is the engine just chasing the head, or exploring the
  long tail?"*

Hit@K / NDCG@K / MRR / Recall@K all answer flavors of *"how right are
you?"*; coverage answers *"how varied?"*. The classical
accuracy/diversity trade-off shows up cleanly here — the agent
typically scores high accuracy and low coverage (it visits exactly the
restaurant it needs), while popularity scores the opposite shape.

## What to point at in the demo

- The same UI runs the eval *and* serves real users. The agent isn't
  navigating a mock — it's clicking the same DOM a real shopper would.
- Tasks include natural-language constraints (*"don't order from X,
  they were terrible last time"*). A ranking engine that ignores the
  constraint scores poorly even if it returns a popular item — the
  agent track is uniquely able to satisfy those.
- The live event log shows the agent doing real work tick-by-tick, so
  the audience sees motion, not a spinner.
- Coverage drops sharply for the agent (it visits one restaurant per
  task, by design). Worth calling out: Hit@K and coverage measure
  different things, and the agent track explicitly trades one for the
  other.

## Likely Q&A

- *"Why can the agent legitimately beat the baselines?"* — Because the
  tasks include free-form natural-language constraints classical
  engines can't read. The agent only wins where language understanding
  matters; on cold-start "show me popular items" tasks, popularity
  baselines remain competitive.
- *"Is the agent cheating with DOM shortcuts?"* — No. The action
  vocabulary is the same a human has (click, type, scroll). It has no
  API access to the underlying DB; it only sees what's rendered.
- *"Is this offline-only?"* — Yes. The harness produces a benchmark
  report. No model serving / online A/B here — that's a separate
  problem.
