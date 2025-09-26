# **UI RL-GYM Declarative Verifier Spec (v1)**

## **0\) What this is**

This specification defines a **declarative verification format** for UI RL-GYMs that store state in the browser's localStorage. It provides a standard way to describe what must be true about the **final localStorage state** after an interaction episode.

Assertions are the basic units of verification: each assertion specifies one or more values to read from localStorage (via JSON paths) and compares them against a literal **ground truth**. The verifier then evaluates each assertion and produces a simple outcome.

Verifier output per assertion: `pass: true|false` (and optionally a numeric score `1.0|0.0`). This declarative approach is extensible and allows gyms to implement consistent, automated checks without custom logic for each scenario.

## **1\) Assertion shape (canonical)**

Every assertion is a JSON object with:

```json
{
  "operator": "OPERATOR_NAME",
  "path": "dotted.path[0].to.value",                 // for single-input ops
  "paths": { "roleA": "path.A", "roleB": "path.B" }, // for multi-input ops (named keys)
  "expectation": <literal | structured literal>,     // ground truth
  "options": { /* operator-specific */ }
}
```

### **Rules**

* Use **`path`** for single-value inputs.  
* Use **`paths`** (an **object with named keys**) only for multi-input ops (e.g., `{ "start": "...", "end": "..." }`).  
* **`expectation`** is the **ground truth literal** (no references to other paths).  
* Omit `expectation` when the operator doesn’t need one (e.g., `EXISTS`, `NOT_EXISTS`).  
* Unrecognized fields must be ignored by implementations (forward-compatibility).

### **Path syntax**

* Dot notation; array indices with brackets: `orders[0].total`, `user.profile.name`.  
* Paths are resolved in the parsed localStorage JSON blob.

---

## **2\) Special literals & accepted formats**

Use these **in `expectation` only** (never inside `path`/`paths`):

* **Time anchors:** `"$NOW"`, `"$TODAY"`, `"$YESTERDAY"`, `"$TOMORROW"`.  
* **Durations:** ISO-8601 duration strings (e.g., `"PT30M"`, `"PT1H"`, `"P1D"`).  
* **Date/time values (inputs & expectations):**  
  * ISO-8601 datetime (e.g., `"2025-09-18T14:30:00Z"` or `"2025-09-18"`).  
  * Epoch milliseconds (number) **or** epoch seconds (number) — specify via `options.input` if needed.

### **Date/time parsing defaults**

* Default timezone: `"UTC"` (recommend always specifying `options.tz`).  
* Default granularity: `"datetime"` (can be `"date"` or `"time"`).  
* When comparing datetimes, values are coerced to instants in the specified timezone (or UTC).

---

## **3\) Operator list (v1)**

### **3.1 JSON\_MATCH**

**What it does:** Deep-equality between the JSON subtree at `path` and the `expectation` JSON.

* **Fields**

  * `path` (required): subtree root.  
  * `expectation` (required): JSON to match.  
  * `options` (optional):  
    * `unorderedArrays` (bool, default `false`): treat arrays as sets (order-insensitive).  
    * `allowExtraKeys` (bool, default `false`): allow extra keys in actual (partial match).

**Example**

```json
{"ZEND-TICKET-CREATE-001: [{
  "operator": "JSON_MATCH",
  "path": "result.tickets",
  "expectation": { "id": "1", "assignee": "John Doe" },
  "options": { "unorderedArrays": false, "allowExtraKeys": false }}, 
 {
  "operator": "JSON_MATCH",
  "path": "result.tickets",
  "expectation": { "id": "1", "assignee": "John Doe" },
  "options": { "unorderedArrays": false, "allowExtraKeys": false }},

]}
```

---

### **3.2 EXISTS**

**What it does:** Passes if `path` is present (resolves to any value, including falsy).

* **Fields:** `path` (required). No `expectation`.

**Example**

```json
{ "operator": "EXISTS", "path": "profile.name" }
```

---

### **3.3 NOT\_EXISTS**

**What it does:** Passes if `path` is missing (does not resolve).

* **Fields:** `path` (required). No `expectation`.

**Example**

```json
{ "operator": "NOT_EXISTS", "path": "session.token" }
```

---

### **3.4 STRING\_MATCH**

**What it does:** Exact string match with optional normalization.

* **Fields**  
  * `path` (required): actual string.  
  * `expectation` (required): expected string.  
  * `options` (optional):  
    * `caseInsensitive` (bool, default `false`)  
    * `trim` (bool, default `false`)  
    * `normalizeWhitespace` (bool, default `false`)

**Example**

```json
{
  "operator": "STRING_MATCH",
  "path": "message.title",
  "expectation": "hello world",
  "options": { "caseInsensitive": true, "trim": true, "normalizeWhitespace": true }
}
```

---

### **3.5 STRING\_CONTAINS**

**What it does:** Substring containment.

* **Fields**  
  * `path` (required): actual string.  
  * `expectation` (required): substring.  
  * `options` (optional):  
    * `caseInsensitive` (bool, default `false`)

**Example**

```json
{
  "operator": "STRING_CONTAINS",
  "path": "message.body",
  "expectation": "order confirmed",
  "options": { "caseInsensitive": true }
}
```

---

### **3.6 COMPARE**

**What it does:** General comparator for numbers, strings, or datetimes.

* **Fields**  
  * `path` (required): left operand.  
  * `expectation` (required): right operand (literal).  
  * `options` (required):  
    * `op`: one of `"=="`, `"!="`, `">"`, `">=", "<"`, "\<="\`  
    * `type`: `"number" | "string" | "datetime" | "boolean"`  
    * For `type: "datetime"`:  
      * `tz` (default `"UTC"`)  
      * `granularity`: `"datetime" | "date" | "time"` (default `"datetime"`)  
      * `input`: `"iso" | "epochMs" | "epochSec"` (default `"iso"`)  
    * For `type: "number"`:  
      * `tolerance` (number, default `0`) — absolute tolerance.

**Examples**

* Number with inclusive bound:

```json
{
  "operator": "COMPARE",
  "path": "user.age",
  "expectation": 18,
  "options": { "op": ">=", "type": "number" }
}
```

* Datetime ordering:

```json
{
  "operator": "COMPARE",
  "path": "event.end",
  "expectation": "$NOW",
  "options": { "op": ">", "type": "datetime", "tz": "UTC", "granularity": "datetime" }
}
```

---

### **3.7 ARRAY\_CONTAINS**

**What it does:** Asserts membership/contents of arrays (primitives or objects).

* **Fields**  
  * `path` (required): actual array.  
  * `expectation` (required): single item **or** array of items.  
    `options` (optional):  
    * `mode`: `"some" | "all" | "exact"` (default `"some"`)  
      * `some`: at least one expected item is present.  
      * `all`: all expected items are present (order ignored).  
      * `exact`: array equals expected items (use `orderSensitive` to control order).  
    * `orderSensitive` (bool, default `false`)  
    * `matchBy`: `"deep" | "key"` (default `"deep"`)  
    * `key`: string (required if `matchBy: "key"`) — e.g., `"id"`.

**Examples**

* Ensure cart has a product with id `2`:

```json
{
  "operator": "ARRAY_CONTAINS",
  "path": "cart.items",
  "expectation": { "id": 2 },
  "options": { "mode": "some", "matchBy": "key", "key": "id" }
}
```

* Ensure roles include both `admin` and `editor`:

```json
{
  "operator": "ARRAY_CONTAINS",
  "path": "roles",
  "expectation": ["admin", "editor"],
  "options": { "mode": "all" }
}
```

* Exact match (order-insensitive):

```json
{
  "operator": "ARRAY_CONTAINS",
  "path": "ids",
  "expectation": [1,2,3],
  "options": { "mode": "exact", "orderSensitive": false }
}
```

---

### **3.8 ARRAY\_LENGTH**

**What it does:** Compares array length to a number.

* **Fields**  
  * `path` (required): actual array.  
  * `expectation` (required): number.  
  * `options` (optional):  
    * `op`: `"==" | ">" | ">=" | "<" | "<="` (default `"=="`)

**Example**

```json
{
  "operator": "ARRAY_LENGTH",
  "path": "search.results",
  "expectation": 10,
  "options": { "op": ">=" }
}
```

---

### **3.9 DATETIME\_IN\_RANGE**

**What it does:** Checks that the datetime at `path` is between `start` and `end`.

* **Fields**  
  * `path` (required): actual datetime value.  
  * `expectation` (required):

```json
{
  "start": <datetime | "$TODAY" | "$NOW">,
  "end":   <datetime | "$TODAY" | "$NOW">,
  "inclusive": true
}
```

  * `options` (optional):  
    * `tz` (default `"UTC"`)  
    * `granularity`: `"datetime" | "date" | "time"` (default `"datetime"`)  
    * `input`: `"iso" | "epochMs" | "epochSec"` (default `"iso"`)

**Examples**

* Start falls within a 1-hour window:

```json
{
  "operator": "DATETIME_IN_RANGE",
  "path": "meeting.start",
  "expectation": {
    "start": "2025-09-18T14:00:00Z",
    "end":   "2025-09-18T15:00:00Z",
    "inclusive": true
  }
}
```

* Starts “today” (date-only comparison in a specific TZ):

```json
{
  "operator": "DATETIME_IN_RANGE",
  "path": "appointment.time",
  "expectation": { "start": "$TODAY", "end": "$TODAY", "inclusive": true },
  "options": { "granularity": "date", "tz": "America/Sao_Paulo" }
}
```

---

### **3.10 DATETIME\_DIFFERENCE**

**What it does:** Verifies the duration between two datetimes.

* **Fields**  
  * `paths` (required): `{ "start": "<path>", "end": "<path>" }`  
  * `expectation` (required): duration — ISO-8601 (e.g., `"PT1H"`) **or** number (milliseconds).  
  * `options` (optional):  
    * `tz` (default `"UTC"`)  
    * `input`: `"iso" | "epochMs" | "epochSec"` (default `"iso"`)  
    * `toleranceMs` (number, default `0`)

**Examples**

* Exactly 1 hour (±5s):

```json
{
  "operator": "DATETIME_DIFFERENCE",
  "paths": { "start": "event.start", "end": "event.end" },
  "expectation": "PT1H",
  "options": { "toleranceMs": 5000 }
}
```

* \~30 minutes using epoch milliseconds:

```json
{
  "operator": "DATETIME_DIFFERENCE",
  "paths": { "start": "job.startedAtMs", "end": "job.finishedAtMs" },
  "expectation": "PT30M",
  "options": { "input": "epochMs", "toleranceMs": 2000 }
}
```

---

## **4\) Aggregating assertions (suite shape)**

A verifier typically receives a list:

```json
{
  "assertions": [
    {
      "operator": "COMPARE",
      "path": "user.age",
      "expectation": 18,
      "options": { "op": ">=", "type": "number" }
    },
    {
      "operator": "ARRAY_CONTAINS",
      "path": "posts",
      "expectation": { "id": "p-42" },
      "options": { "mode": "some", "matchBy": "key", "key": "id" }
    },
    {
      "operator": "DATETIME_DIFFERENCE",
      "paths": { "start": "event.start", "end": "event.end" },
      "expectation": "PT1H",
      "options": { "toleranceMs": 300000 }
    }
  ]
}
```

Scoring strategy is up to the Gym (e.g., boolean AND over all assertions, or per-assertion scores averaged).

---

## **5\) Response-Dependent Tasks**

Some tasks require the agent to gather information and generate a model response (e.g., comparing prices across stores). These tasks extend the basic assertion format with additional rubric-based evaluation.

### **5.1 Task Types**

* **`standard`** (default): Traditional UI interaction tasks with localStorage assertions only
* **`response-dependent`**: Tasks that require both localStorage assertions AND model response evaluation

### **5.2 Rubric Structure**

A rubric defines how to evaluate a model response. It consists of:

```json
{
  "rubric": {
    "type": "static | hybrid | llm",
    "groundTruth": { /* optional: known correct answers */ },
    "criteria": [ /* array of evaluation criteria */ ]
  }
}
```

#### **5.2.1 Rubric Types**

* **`static`**: Rule-based evaluation using simple checks (length, keywords, format)
* **`hybrid`**: Combination of ground truth checks, rule-based checks, and optional LLM evaluation
* **`llm`**: Primarily LLM-based evaluation with minimal rule-based checks

#### **5.2.2 Ground Truth Data**

The `groundTruth` object contains known correct answers for objective evaluation:

```json
"groundTruth": {
  "correctAnswer": "McDonald's",
  "expectedValues": [1, 2, 3],
  "requiredEntities": ["store1", "store2", "store3"],
  "structuredData": {
    "prices": {"store1": 4.50, "store2": 2.99},
    "quantities": {"item1": 1, "item2": 3}
  }
}
```

#### **5.2.3 Criteria Array**

Each criterion defines one specific evaluation check:

```json
{
  "name": "unique_identifier",
  "description": "Human-readable description",
  "type": "groundTruth | contains | length | format | llm_eval",
  "weight": 0.4,
  "field": "groundTruthFieldName",     // for groundTruth type
  "value": ["keyword1", "keyword2"],   // for contains type
  "minLength": 50,                     // for length type
  "maxLength": 500,                    // for length type
  "prompt": "LLM evaluation prompt"    // for llm_eval type
}
```

### **5.3 Evaluation Types**

* **`groundTruth`**: Check if response contains the correct answer from ground truth data
* **`contains`**: Check if response contains specific keywords or phrases
* **`length`**: Check if response meets length requirements
* **`format`**: Check if response follows required format/structure
* **`llm_eval`**: Use LLM to evaluate response quality or correctness

#### **5.3.1 LLM Evaluation Prompts**

LLM evaluation prompts must be specific and provide clear success criteria. Avoid vague questions like "Is this good?" Instead, provide:

* **Specific criteria** to check for
* **Clear examples** of what constitutes success
* **Explicit pass/fail conditions**
* **Structured evaluation format**

**Good Example:**
```
"Evaluate if the response provides clear reasoning for the store recommendation. The response should: 1) Mention specific price comparisons between stores, 2) Explain why the chosen store is most economical, 3) Reference actual price values or savings. Rate as PASS if all criteria are met, FAIL if any are missing."
```

**Bad Example:**
```
"Does the response provide clear reasoning for the recommendation?"
```

**Best Practices:**
* Use numbered criteria for clarity
* Specify exactly what to look for
* Provide clear pass/fail conditions
* Include context about the task domain
* Ask for binary PASS/FAIL responses when possible

### **5.4 Complete Example**

```json
{
  "taskId": "compare-prices-3-stores",
  "description": "Compare prices at 3 stores and identify the most economical option",
  "type": "response-dependent",
  "assertions": [
    {
      "operator": "EXISTS",
      "path": "visited-stores"
    },
    {
      "operator": "ARRAY_LENGTH",
      "path": "visited-stores",
      "expectation": 3
    }
  ],
  "rubric": {
    "type": "hybrid",
    "groundTruth": {
      "cheapestStore": "McDonald's",
      "cheapestPrice": 2.99,
      "allStores": ["Starbucks", "McDonald's", "Subway"]
    },
    "criteria": [
      {
        "name": "correct_cheapest_store",
        "description": "Response must correctly identify McDonald's as the cheapest store",
        "type": "groundTruth",
        "field": "cheapestStore",
        "weight": 0.4
      },
      {
        "name": "mentions_all_stores",
        "description": "Response must mention all three stores",
        "type": "contains",
        "value": ["Starbucks", "McDonald's", "Subway"],
        "weight": 0.2
      },
      {
        "name": "appropriate_length",
        "description": "Response must be between 50-500 characters",
        "type": "length",
        "minLength": 50,
        "maxLength": 500,
        "weight": 0.1
      },
      {
        "name": "provides_reasoning",
        "description": "Response must explain the recommendation",
        "type": "llm_eval",
        "prompt": "Evaluate if the response provides clear reasoning for the store recommendation. The response should: 1) Mention specific price comparisons between stores, 2) Explain why the chosen store is most economical, 3) Reference actual price values or savings. Rate as PASS if all criteria are met, FAIL if any are missing.",
        "weight": 0.3
      }
    ]
  }
}
```

---

## **6\) Errors & edge cases (recommended behavior)**

* **Missing `path`/`paths`:** treat as invalid assertion → fail with reason.  
* **Path not found:** operator fails (unless `NOT_EXISTS`).  
* **Type mismatch:** operator fails with a clear reason.  
* **Datetime parsing failure:** fail with reason; include which value couldn't be parsed.  
* **Unknown operator/option:** ignore unknown options; unknown operator → fail.
* **Missing rubric for response-dependent tasks:** treat as incomplete task definition → fail with reason.
* **Invalid rubric criteria weights:** warn if weights don't sum to 1.0, but don't fail.
* **Unknown rubric evaluation type:** ignore unknown types, log warning.

