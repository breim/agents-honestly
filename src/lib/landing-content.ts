export const openingQuestions = [
  {
    question: 'Who should own this state?',
    answer: 'Almost every architectural mistake in this field is the same mistake: state held by the wrong layer.',
  },
  {
    question: 'Where does the answer live?',
    answer: 'Most teams answer "vector database" reflexively, and pay for it for a year.',
  },
  {
    question: 'Does this need an agent at all?',
    answer: 'Every rung up the ladder costs latency, money and predictability. Take one only when the rung below cannot do it.',
  },
];

export const tutorialAgent = [
  'lives inside a single process',
  'runs for a few seconds',
  'serves one cooperative user',
  'spends a budget nobody measures',
  'reads data nobody guards',
];

export const productionAgent = [
  'lives across deploys, and gets interrupted',
  'waits days for a human',
  'runs a thousand times in parallel against a provider that throttles you',
  'reads documents an attacker may have written',
  'spends real money on every retry',
];

export const stateLadder = [
  ['The model is choosing, reasoning or judging', 'Agent runtime'],
  ['Conversation position, intermediate results, the plan', 'Graph state'],
  ['A process that must survive hours, deploys and crashes', 'Workflow'],
  ['Facts the business considers true', 'Database and APIs'],
];

export const answerRoutes = [
  ['"similar to…", "about…", "related to…"', 'Vector search', 'Meaning matters more than wording'],
  ['"INC-93842", an exact name, a code', 'Lexical search', 'Embeddings are bad at identifiers'],
  ['"how many", "total", "between these dates"', 'SQL', 'It is an aggregation, not a retrieval'],
  ['"who is connected to what"', 'Graph', 'The relationship is the answer'],
  ['"what is the status right now"', 'API call', 'An index is a stale copy by definition'],
  ['"what is our policy on…"', 'Retrieval', 'Genuinely a corpus question'],
];

export const atlasForces = [
  ['Answer "what is our policy on…"', 'Retrieval, chunking, grounding, citations'],
  ['Answer "how much did we sell in Spain in Q2"', 'That this is SQL, not retrieval'],
  ['Answer "why is the Acme account at risk"', 'Multi-hop relationships across systems'],
  ['Never show one tenant another tenant’s documents', 'Metadata filtering as an authorization boundary'],
  ['Ignore instructions hidden inside a document', 'That retrieved text is untrusted input'],
  ['Issue a refund, then email the customer', 'Compensating a side effect when step two fails'],
  ['Escalate anything over the policy limit', 'Human-in-the-loop that holds no process open'],
  ['Wait days for a customer to reply', 'State that outlives every process and deploy'],
];

export const arc = [
  ['I–II', 'The model, and the loop', 'You can build an agent with no framework and explain every line'],
  ['III–V', 'Context, retrieval, knowledge', 'You know where an answer lives before you go looking for it'],
  ['VI–IX', 'Workflows, graphs, tools, MCP', 'You can decide what should be an agent and choose the right remote boundary'],
  ['X–XII', 'Durable execution, humans', 'It survives crashes, deploys, and a three-day wait for approval'],
  ['XIII', 'Interface', 'People can use it across ability, language and voice, and trust what they see'],
  ['XIV–XVII', 'Evals, tracing, reliability, security', 'You can prove it works and defend it when it is attacked'],
  ['XVIII–XX', 'Production, governance, multi-agent', 'You can run it, introduce it into real work, and know when to stop'],
];

export const counts = [
  ['23', 'parts'],
  ['214', 'chapters'],
  ['66', 'catalog entries'],
  ['49', 'on the core path'],
];

export const catalogCategories = [
  'Context',
  'Retrieval',
  'Control',
  'Durability',
  'Scale',
  'Failure',
  'Security',
  'Cost',
  'Evaluation',
];

export const catalogShape = [
  'Problem',
  'Forces',
  'Solution',
  'Code',
  'Trade-offs',
  'When not to use it',
  'Related',
];

export const exclusions = [
  [
    'Not a framework manual.',
    'LangChain, LangGraph, Temporal and the AI SDK have documentation, and it is better than a book could reproduce. This covers what those docs assume you already know.',
  ],
  [
    'Not prompt engineering.',
    'Only the parts that generalize — how tokens and context work, how tool schemas shape behavior. The rest belongs in a blog post with a date on it.',
  ],
  [
    'Not machine learning.',
    'Nothing here trains a model. Evals are the one place you borrow from ML, and what you borrow is the measurement discipline, not the gradients.',
  ],
];

export const startHere = [
  ['preface', 'Preface', 'Who this is for, what you will build, and why most agent material stops right before the hard part.'],
  ['the-map', 'The Agentic Engineer’s Map', 'The whole system on one page: which layer owns which decision.'],
  ['how-to-read', 'How to Read This Book', 'Two books in one — a narrative build, and a catalog you consult forever.'],
  ['core-path', 'The Core Path', 'The shortest route through the book that still leaves you able to ship.'],
  ['setup', 'Setup', 'Keys, a local Temporal server, Postgres with pgvector, and the repo layout for both tracks.'],
];
