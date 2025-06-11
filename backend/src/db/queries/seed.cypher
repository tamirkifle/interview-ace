// Create Categories with colors
MERGE (c1:Category {id: 'cat-leadership', name: 'Leadership', description: 'Leading teams, taking ownership, driving results', color: '#4F46E5'})
MERGE (c2:Category {id: 'cat-teamwork', name: 'Teamwork', description: 'Collaboration, conflict resolution, cross-functional work', color: '#059669'})
MERGE (c3:Category {id: 'cat-problem-solving', name: 'Problem Solving', description: 'Technical challenges, creative solutions, debugging', color: '#DC2626'})
MERGE (c4:Category {id: 'cat-communication', name: 'Communication', description: 'Explaining complex topics, persuasion, presentations', color: '#7C3AED'})
MERGE (c5:Category {id: 'cat-innovation', name: 'Innovation', description: 'New ideas, improving processes, thinking differently', color: '#EA580C'})
MERGE (c6:Category {id: 'cat-adversity', name: 'Adversity', description: 'Failures, setbacks, learning from mistakes', color: '#991B1B'})
MERGE (c7:Category {id: 'cat-impact', name: 'Impact', description: 'Measurable results, business outcomes, value creation', color: '#0D9488'})
MERGE (c8:Category {id: 'cat-growth', name: 'Growth', description: 'Learning new skills, feedback, mentoring', color: '#CA8A04'});

// Create Traits
MERGE (t1:Trait {id: 'trait-initiative', name: 'Initiative', description: 'Taking action without being asked'})
MERGE (t2:Trait {id: 'trait-collaboration', name: 'Collaboration', description: 'Working effectively with others'})
MERGE (t3:Trait {id: 'trait-adaptability', name: 'Adaptability', description: 'Adjusting to change and ambiguity'})
MERGE (t4:Trait {id: 'trait-resilience', name: 'Resilience', description: 'Bouncing back from setbacks'})
MERGE (t5:Trait {id: 'trait-empathy', name: 'Empathy', description: 'Understanding others perspectives'})
MERGE (t6:Trait {id: 'trait-analytical-thinking', name: 'Analytical Thinking', description: 'Breaking down complex problems'})
MERGE (t7:Trait {id: 'trait-customer-focus', name: 'Customer Focus', description: 'Prioritizing user/customer needs'})
MERGE (t8:Trait {id: 'trait-ownership', name: 'Ownership', description: 'Taking responsibility for outcomes'})
MERGE (t9:Trait {id: 'trait-influence', name: 'Influence', description: 'Persuading and inspiring others'})
MERGE (t10:Trait {id: 'trait-strategic-thinking', name: 'Strategic Thinking', description: 'Seeing the big picture'})
MERGE (t11:Trait {id: 'trait-execution', name: 'Execution', description: 'Getting things done effectively'})
MERGE (t12:Trait {id: 'trait-creativity', name: 'Creativity', description: 'Finding novel solutions'})
MERGE (t13:Trait {id: 'trait-data-driven', name: 'Data-Driven', description: 'Using metrics to guide decisions'})
MERGE (t14:Trait {id: 'trait-humility', name: 'Humility', description: 'Being open to feedback and learning'})
MERGE (t15:Trait {id: 'trait-integrity', name: 'Integrity', description: 'Doing the right thing'})
MERGE (t16:Trait {id: 'trait-results-oriented', name: 'Results-Oriented', description: 'Focusing on outcomes'});

// Create Questions with new fields
MERGE (q1:Question {id: 'q-leadership-challenge', text: 'Tell me about a time you led a team through a challenging project', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q2:Question {id: 'q-influence-without-authority', text: 'Describe a situation where you had to influence without direct authority', difficulty: 'hard', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q3:Question {id: 'q-difficult-decision', text: 'Give an example of when you had to make a difficult decision with limited information', difficulty: 'hard', commonality: 9, createdAt: datetime(), updatedAt: datetime()})
MERGE (q4:Question {id: 'q-disagreement', text: 'Tell me about a time you disagreed with a coworker. How did you handle it?', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q5:Question {id: 'q-difficult-team-member', text: 'Describe a situation where you had to work with a difficult team member', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q6:Question {id: 'q-helping-teammate', text: 'Give an example of when you helped a struggling teammate', difficulty: 'easy', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q7:Question {id: 'q-complex-technical', text: 'Tell me about the most complex technical problem you have solved', difficulty: 'hard', commonality: 9, createdAt: datetime(), updatedAt: datetime()})
MERGE (q8:Question {id: 'q-debug-under-pressure', text: 'Describe a time when you had to debug a critical issue under pressure', difficulty: 'hard', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q9:Question {id: 'q-unclear-solution', text: 'How did you approach a problem where the solution was not obvious?', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q10:Question {id: 'q-technical-to-non-technical', text: 'Tell me about a time you had to explain a technical concept to non-technical stakeholders', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q11:Question {id: 'q-difficult-feedback', text: 'Describe a situation where you had to deliver difficult feedback', difficulty: 'hard', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q12:Question {id: 'q-presentation-issues', text: 'Give an example of a presentation that did not go as planned', difficulty: 'medium', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q13:Question {id: 'q-improve-process', text: 'Tell me about a time you improved an existing process', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q14:Question {id: 'q-creative-solution', text: 'Describe a creative solution you came up with to solve a problem', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q15:Question {id: 'q-challenge-status-quo', text: 'When have you challenged the status quo?', difficulty: 'hard', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q16:Question {id: 'q-biggest-failure', text: 'Tell me about your biggest failure and what you learned from it', difficulty: 'hard', commonality: 9, createdAt: datetime(), updatedAt: datetime()})
MERGE (q17:Question {id: 'q-harsh-criticism', text: 'Describe a time when you received harsh criticism', difficulty: 'hard', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q18:Question {id: 'q-cancelled-project', text: 'Give an example of when a project you worked on was cancelled', difficulty: 'medium', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q19:Question {id: 'q-proudest-achievement', text: 'What is your proudest professional achievement?', difficulty: 'easy', commonality: 9, createdAt: datetime(), updatedAt: datetime()})
MERGE (q20:Question {id: 'q-exceed-expectations', text: 'Tell me about a time you exceeded expectations', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q21:Question {id: 'q-business-value', text: 'Describe a project where you delivered significant business value', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q22:Question {id: 'q-learn-quickly', text: 'Tell me about a time you had to learn a new skill quickly', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q23:Question {id: 'q-mentoring', text: 'Describe how you have mentored someone', difficulty: 'medium', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q24:Question {id: 'q-comfort-zone', text: 'When have you stepped outside your comfort zone?', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q25:Question {id: 'q-competing-priorities', text: 'Tell me about a time you had to balance multiple competing priorities', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q26:Question {id: 'q-ambiguous-requirements', text: 'Describe a situation where you had to work with ambiguous requirements', difficulty: 'hard', commonality: 7, createdAt: datetime(), updatedAt: datetime()})
MERGE (q27:Question {id: 'q-pivot-approach', text: 'Tell me about a time you had to pivot your approach', difficulty: 'medium', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q28:Question {id: 'q-tight-deadline', text: 'Give an example of when you had to meet a tight deadline', difficulty: 'medium', commonality: 8, createdAt: datetime(), updatedAt: datetime()})
MERGE (q29:Question {id: 'q-say-no', text: 'Describe a time when you had to say no to a request', difficulty: 'hard', commonality: 6, createdAt: datetime(), updatedAt: datetime()})
MERGE (q30:Question {id: 'q-identify-problem', text: 'Tell me about a time you identified a problem before it became serious', difficulty: 'medium', commonality: 7, createdAt: datetime(), updatedAt: datetime()});

// Create Stories with STAR format
MERGE (s1:Story {
  id: 'story-leadership-challenge',
  title: 'Leading a Critical Project Turnaround',
  situation: 'Our team was struggling with a critical project that was behind schedule and over budget.',
  task: 'I needed to take over as project lead and get the project back on track.',
  action: 'I restructured the team, implemented daily standups, and created a clear roadmap with milestones.',
  result: 'We delivered the project on time and under budget, with improved team morale.',
  createdAt: datetime(),
  updatedAt: datetime()
});

MERGE (s2:Story {
  id: 'story-technical-challenge',
  title: 'Solving a Complex System Outage',
  situation: 'Our production system experienced a critical outage affecting thousands of users.',
  task: 'I needed to lead the investigation and resolution of the system failure.',
  action: 'I coordinated the team, analyzed logs, and implemented a fix with proper testing.',
  result: 'We restored service within 2 hours and implemented safeguards to prevent future outages.',
  createdAt: datetime(),
  updatedAt: datetime()
});

// Create Recordings
MERGE (r1:Recording {
  id: 'rec-leadership-1',
  filename: 'leadership_challenge_1.mp3',
  duration: 180,
  minio_key: 'recordings/leadership_challenge_1.mp3',
  createdAt: datetime()
});

MERGE (r2:Recording {
  id: 'rec-technical-1',
  filename: 'technical_challenge_1.mp3',
  duration: 240,
  minio_key: 'recordings/technical_challenge_1.mp3',
  createdAt: datetime()
});

// Create relationships between Stories and Categories
MATCH (s:Story {id: 'story-leadership-challenge'})
MATCH (c:Category)
WHERE c.id IN ['cat-leadership', 'cat-impact']
WITH s, c
MERGE (s)-[:BELONGS_TO]->(c);

MATCH (s:Story {id: 'story-technical-challenge'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-impact']
WITH s, c
MERGE (s)-[:BELONGS_TO]->(c);

// Create relationships between Stories and Traits
MATCH (s:Story {id: 'story-leadership-challenge'})
MATCH (t:Trait)
WHERE t.id IN ['trait-ownership', 'trait-influence', 'trait-execution']
WITH s, t
MERGE (s)-[:DEMONSTRATES]->(t);

MATCH (s:Story {id: 'story-technical-challenge'})
MATCH (t:Trait)
WHERE t.id IN ['trait-analytical-thinking', 'trait-execution', 'trait-resilience']
WITH s, t
MERGE (s)-[:DEMONSTRATES]->(t);

// Create relationships between Recordings and Stories/Questions
MATCH (r:Recording {id: 'rec-leadership-1'})
MATCH (s:Story {id: 'story-leadership-challenge'})
WITH r, s
MERGE (r)-[:RECORDS]->(s);

MATCH (r:Recording {id: 'rec-leadership-1'})
MATCH (q:Question {id: 'q-leadership-challenge'})
WITH r, q
MERGE (r)-[:ANSWERS]->(q);

MATCH (r:Recording {id: 'rec-technical-1'})
MATCH (s:Story {id: 'story-technical-challenge'})
WITH r, s
MERGE (r)-[:RECORDS]->(s);

MATCH (r:Recording {id: 'rec-technical-1'})
MATCH (q:Question {id: 'q-complex-technical'})
WITH r, q
MERGE (r)-[:ANSWERS]->(q);

// Create relationships between Questions and Categories
MATCH (q:Question {id: 'q-leadership-challenge'})
MATCH (c:Category)
WHERE c.id IN ['cat-leadership', 'cat-impact']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-influence-without-authority'})
MATCH (c:Category)
WHERE c.id IN ['cat-leadership', 'cat-communication']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-difficult-decision'})
MATCH (c:Category)
WHERE c.id IN ['cat-leadership', 'cat-problem-solving']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Teamwork Questions
MATCH (q:Question {id: 'q-disagreement'})
MATCH (c:Category)
WHERE c.id IN ['cat-teamwork', 'cat-communication']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-difficult-team-member'})
MATCH (c:Category)
WHERE c.id IN ['cat-teamwork', 'cat-adversity']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-helping-teammate'})
MATCH (c:Category)
WHERE c.id IN ['cat-teamwork', 'cat-growth']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Problem Solving Questions
MATCH (q:Question {id: 'q-complex-technical'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-impact']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-debug-under-pressure'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-adversity']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-unclear-solution'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-innovation']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Communication Questions
MATCH (q:Question {id: 'q-technical-to-non-technical'})
MATCH (c:Category)
WHERE c.id IN ['cat-communication', 'cat-impact']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-difficult-feedback'})
MATCH (c:Category)
WHERE c.id IN ['cat-communication', 'cat-teamwork']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-presentation-issues'})
MATCH (c:Category)
WHERE c.id IN ['cat-communication', 'cat-adversity']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Innovation Questions
MATCH (q:Question {id: 'q-improve-process'})
MATCH (c:Category)
WHERE c.id IN ['cat-innovation', 'cat-impact']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-creative-solution'})
MATCH (c:Category)
WHERE c.id IN ['cat-innovation', 'cat-problem-solving']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-challenge-status-quo'})
MATCH (c:Category)
WHERE c.id IN ['cat-innovation', 'cat-leadership']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Adversity Questions
MATCH (q:Question {id: 'q-biggest-failure'})
MATCH (c:Category)
WHERE c.id IN ['cat-adversity', 'cat-growth']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-harsh-criticism'})
MATCH (c:Category)
WHERE c.id IN ['cat-adversity', 'cat-growth']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-cancelled-project'})
MATCH (c:Category)
WHERE c.id IN ['cat-adversity', 'cat-teamwork']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Impact Questions
MATCH (q:Question {id: 'q-proudest-achievement'})
MATCH (c:Category)
WHERE c.id IN ['cat-impact', 'cat-leadership']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-exceed-expectations'})
MATCH (c:Category)
WHERE c.id IN ['cat-impact', 'cat-innovation']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-business-value'})
MATCH (c:Category)
WHERE c.id IN ['cat-impact', 'cat-problem-solving']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Growth Questions
MATCH (q:Question {id: 'q-learn-quickly'})
MATCH (c:Category)
WHERE c.id IN ['cat-growth', 'cat-problem-solving']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-mentoring'})
MATCH (c:Category)
WHERE c.id IN ['cat-growth', 'cat-teamwork']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-comfort-zone'})
MATCH (c:Category)
WHERE c.id IN ['cat-growth', 'cat-innovation']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Cross-Category Questions
MATCH (q:Question {id: 'q-competing-priorities'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-leadership']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-ambiguous-requirements'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-communication']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-pivot-approach'})
MATCH (c:Category)
WHERE c.id IN ['cat-adversity', 'cat-innovation']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-tight-deadline'})
MATCH (c:Category)
WHERE c.id IN ['cat-impact', 'cat-problem-solving']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-say-no'})
MATCH (c:Category)
WHERE c.id IN ['cat-communication', 'cat-leadership']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question {id: 'q-identify-problem'})
MATCH (c:Category)
WHERE c.id IN ['cat-problem-solving', 'cat-impact']
WITH q, c
MERGE (q)-[:TESTS_FOR]->(c);

// Create relationships between Questions and Traits
MATCH (q:Question {id: 'q-leadership-challenge'})
MATCH (t:Trait)
WHERE t.id IN ['trait-ownership', 'trait-influence', 'trait-execution']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-influence-without-authority'})
MATCH (t:Trait)
WHERE t.id IN ['trait-influence', 'trait-strategic-thinking', 'trait-empathy']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-difficult-decision'})
MATCH (t:Trait)
WHERE t.id IN ['trait-analytical-thinking', 'trait-ownership', 'trait-strategic-thinking']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Teamwork Questions
MATCH (q:Question {id: 'q-disagreement'})
MATCH (t:Trait)
WHERE t.id IN ['trait-collaboration', 'trait-empathy', 'trait-integrity']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-difficult-team-member'})
MATCH (t:Trait)
WHERE t.id IN ['trait-resilience', 'trait-collaboration', 'trait-empathy']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-helping-teammate'})
MATCH (t:Trait)
WHERE t.id IN ['trait-empathy', 'trait-collaboration', 'trait-initiative']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Problem Solving Questions
MATCH (q:Question {id: 'q-complex-technical'})
MATCH (t:Trait)
WHERE t.id IN ['trait-analytical-thinking', 'trait-execution', 'trait-creativity']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-debug-under-pressure'})
MATCH (t:Trait)
WHERE t.id IN ['trait-analytical-thinking', 'trait-resilience', 'trait-execution']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-unclear-solution'})
MATCH (t:Trait)
WHERE t.id IN ['trait-creativity', 'trait-analytical-thinking', 'trait-initiative']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Communication Questions
MATCH (q:Question {id: 'q-technical-to-non-technical'})
MATCH (t:Trait)
WHERE t.id IN ['trait-empathy', 'trait-influence', 'trait-customer-focus']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-difficult-feedback'})
MATCH (t:Trait)
WHERE t.id IN ['trait-integrity', 'trait-empathy', 'trait-influence']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-presentation-issues'})
MATCH (t:Trait)
WHERE t.id IN ['trait-adaptability', 'trait-resilience', 'trait-initiative']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Innovation Questions
MATCH (q:Question {id: 'q-improve-process'})
MATCH (t:Trait)
WHERE t.id IN ['trait-initiative', 'trait-creativity', 'trait-results-oriented']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-creative-solution'})
MATCH (t:Trait)
WHERE t.id IN ['trait-creativity', 'trait-analytical-thinking', 'trait-initiative']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-challenge-status-quo'})
MATCH (t:Trait)
WHERE t.id IN ['trait-initiative', 'trait-strategic-thinking', 'trait-influence']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Adversity Questions
MATCH (q:Question {id: 'q-biggest-failure'})
MATCH (t:Trait)
WHERE t.id IN ['trait-resilience', 'trait-humility', 'trait-integrity']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-harsh-criticism'})
MATCH (t:Trait)
WHERE t.id IN ['trait-humility', 'trait-adaptability', 'trait-resilience']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-cancelled-project'})
MATCH (t:Trait)
WHERE t.id IN ['trait-resilience', 'trait-adaptability', 'trait-empathy']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Impact Questions
MATCH (q:Question {id: 'q-proudest-achievement'})
MATCH (t:Trait)
WHERE t.id IN ['trait-results-oriented', 'trait-execution', 'trait-ownership']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-exceed-expectations'})
MATCH (t:Trait)
WHERE t.id IN ['trait-initiative', 'trait-results-oriented', 'trait-execution']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-business-value'})
MATCH (t:Trait)
WHERE t.id IN ['trait-data-driven', 'trait-results-oriented', 'trait-strategic-thinking']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Growth Questions
MATCH (q:Question {id: 'q-learn-quickly'})
MATCH (t:Trait)
WHERE t.id IN ['trait-adaptability', 'trait-initiative', 'trait-execution']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-mentoring'})
MATCH (t:Trait)
WHERE t.id IN ['trait-empathy', 'trait-initiative', 'trait-influence']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-comfort-zone'})
MATCH (t:Trait)
WHERE t.id IN ['trait-initiative', 'trait-adaptability', 'trait-humility']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Cross-Category Questions
MATCH (q:Question {id: 'q-competing-priorities'})
MATCH (t:Trait)
WHERE t.id IN ['trait-strategic-thinking', 'trait-execution', 'trait-adaptability']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-ambiguous-requirements'})
MATCH (t:Trait)
WHERE t.id IN ['trait-adaptability', 'trait-initiative', 'trait-customer-focus']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-pivot-approach'})
MATCH (t:Trait)
WHERE t.id IN ['trait-adaptability', 'trait-resilience', 'trait-strategic-thinking']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-tight-deadline'})
MATCH (t:Trait)
WHERE t.id IN ['trait-execution', 'trait-ownership', 'trait-results-oriented']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-say-no'})
MATCH (t:Trait)
WHERE t.id IN ['trait-integrity', 'trait-strategic-thinking', 'trait-influence']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question {id: 'q-identify-problem'})
MATCH (t:Trait)
WHERE t.id IN ['trait-initiative', 'trait-analytical-thinking', 'trait-ownership']
WITH q, t
MERGE (q)-[:TESTS_FOR]->(t);

// Create ANSWERS relationships between Stories and Questions based on shared categories
MATCH (s:Story)-[:BELONGS_TO]->(c:Category)<-[:TESTS_FOR]-(q:Question)
WITH s, q, count(DISTINCT c) as sharedCategories
WHERE sharedCategories >= 1
WITH s, q, sharedCategories
MATCH (s)-[:DEMONSTRATES]->(t:Trait)<-[:TESTS_FOR]-(q)
WITH s, q, sharedCategories, count(DISTINCT t) as sharedTraits
WHERE sharedCategories >= 1 OR sharedTraits >= 1
MERGE (s)-[:ANSWERS]->(q);