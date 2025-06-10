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

// Create Questions
MERGE (q1:Question {id: 'q-leadership-challenge', text: 'Tell me about a time you led a team through a challenging project'})
MERGE (q2:Question {id: 'q-influence-without-authority', text: 'Describe a situation where you had to influence without direct authority'})
MERGE (q3:Question {id: 'q-difficult-decision', text: 'Give an example of when you had to make a difficult decision with limited information'})
MERGE (q4:Question {id: 'q-disagreement', text: 'Tell me about a time you disagreed with a coworker. How did you handle it?'})
MERGE (q5:Question {id: 'q-difficult-team-member', text: 'Describe a situation where you had to work with a difficult team member'})
MERGE (q6:Question {id: 'q-helping-teammate', text: 'Give an example of when you helped a struggling teammate'})
MERGE (q7:Question {id: 'q-complex-technical', text: 'Tell me about the most complex technical problem you have solved'})
MERGE (q8:Question {id: 'q-debug-under-pressure', text: 'Describe a time when you had to debug a critical issue under pressure'})
MERGE (q9:Question {id: 'q-unclear-solution', text: 'How did you approach a problem where the solution was not obvious?'})
MERGE (q10:Question {id: 'q-technical-to-non-technical', text: 'Tell me about a time you had to explain a technical concept to non-technical stakeholders'})
MERGE (q11:Question {id: 'q-difficult-feedback', text: 'Describe a situation where you had to deliver difficult feedback'})
MERGE (q12:Question {id: 'q-presentation-issues', text: 'Give an example of a presentation that did not go as planned'})
MERGE (q13:Question {id: 'q-improve-process', text: 'Tell me about a time you improved an existing process'})
MERGE (q14:Question {id: 'q-creative-solution', text: 'Describe a creative solution you came up with to solve a problem'})
MERGE (q15:Question {id: 'q-challenge-status-quo', text: 'When have you challenged the status quo?'})
MERGE (q16:Question {id: 'q-biggest-failure', text: 'Tell me about your biggest failure and what you learned from it'})
MERGE (q17:Question {id: 'q-harsh-criticism', text: 'Describe a time when you received harsh criticism'})
MERGE (q18:Question {id: 'q-cancelled-project', text: 'Give an example of when a project you worked on was cancelled'})
MERGE (q19:Question {id: 'q-proudest-achievement', text: 'What is your proudest professional achievement?'})
MERGE (q20:Question {id: 'q-exceed-expectations', text: 'Tell me about a time you exceeded expectations'})
MERGE (q21:Question {id: 'q-business-value', text: 'Describe a project where you delivered significant business value'})
MERGE (q22:Question {id: 'q-learn-quickly', text: 'Tell me about a time you had to learn a new skill quickly'})
MERGE (q23:Question {id: 'q-mentoring', text: 'Describe how you have mentored someone'})
MERGE (q24:Question {id: 'q-comfort-zone', text: 'When have you stepped outside your comfort zone?'})
MERGE (q25:Question {id: 'q-competing-priorities', text: 'Tell me about a time you had to balance multiple competing priorities'})
MERGE (q26:Question {id: 'q-ambiguous-requirements', text: 'Describe a situation where you had to work with ambiguous requirements'})
MERGE (q27:Question {id: 'q-pivot-approach', text: 'Tell me about a time you had to pivot your approach'})
MERGE (q28:Question {id: 'q-tight-deadline', text: 'Give an example of when you had to meet a tight deadline'})
MERGE (q29:Question {id: 'q-say-no', text: 'Describe a time when you had to say no to a request'})
MERGE (q30:Question {id: 'q-identify-problem', text: 'Tell me about a time you identified a problem before it became serious'});

// Create relationships between Questions and Categories
// Leadership Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-leadership-challenge' AND c.id IN ['cat-leadership', 'cat-impact']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-influence-without-authority' AND c.id IN ['cat-leadership', 'cat-communication']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-difficult-decision' AND c.id IN ['cat-leadership', 'cat-problem-solving']
MERGE (q)-[:TESTS_FOR]->(c);

// Teamwork Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-disagreement' AND c.id IN ['cat-teamwork', 'cat-communication']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-difficult-team-member' AND c.id IN ['cat-teamwork', 'cat-adversity']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-helping-teammate' AND c.id IN ['cat-teamwork', 'cat-growth']
MERGE (q)-[:TESTS_FOR]->(c);

// Problem Solving Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-complex-technical' AND c.id IN ['cat-problem-solving', 'cat-impact']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-debug-under-pressure' AND c.id IN ['cat-problem-solving', 'cat-adversity']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-unclear-solution' AND c.id IN ['cat-problem-solving', 'cat-innovation']
MERGE (q)-[:TESTS_FOR]->(c);

// Communication Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-technical-to-non-technical' AND c.id IN ['cat-communication', 'cat-impact']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-difficult-feedback' AND c.id IN ['cat-communication', 'cat-teamwork']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-presentation-issues' AND c.id IN ['cat-communication', 'cat-adversity']
MERGE (q)-[:TESTS_FOR]->(c);

// Innovation Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-improve-process' AND c.id IN ['cat-innovation', 'cat-impact']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-creative-solution' AND c.id IN ['cat-innovation', 'cat-problem-solving']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-challenge-status-quo' AND c.id IN ['cat-innovation', 'cat-leadership']
MERGE (q)-[:TESTS_FOR]->(c);

// Adversity Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-biggest-failure' AND c.id IN ['cat-adversity', 'cat-growth']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-harsh-criticism' AND c.id IN ['cat-adversity', 'cat-growth']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-cancelled-project' AND c.id IN ['cat-adversity', 'cat-teamwork']
MERGE (q)-[:TESTS_FOR]->(c);

// Impact Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-proudest-achievement' AND c.id IN ['cat-impact', 'cat-leadership']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-exceed-expectations' AND c.id IN ['cat-impact', 'cat-innovation']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-business-value' AND c.id IN ['cat-impact', 'cat-problem-solving']
MERGE (q)-[:TESTS_FOR]->(c);

// Growth Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-learn-quickly' AND c.id IN ['cat-growth', 'cat-problem-solving']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-mentoring' AND c.id IN ['cat-growth', 'cat-teamwork']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-comfort-zone' AND c.id IN ['cat-growth', 'cat-innovation']
MERGE (q)-[:TESTS_FOR]->(c);

// Cross-Category Questions
MATCH (q:Question), (c:Category)
WHERE q.id = 'q-competing-priorities' AND c.id IN ['cat-problem-solving', 'cat-leadership']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-ambiguous-requirements' AND c.id IN ['cat-problem-solving', 'cat-communication']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-pivot-approach' AND c.id IN ['cat-adversity', 'cat-innovation']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-tight-deadline' AND c.id IN ['cat-impact', 'cat-problem-solving']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-say-no' AND c.id IN ['cat-communication', 'cat-leadership']
MERGE (q)-[:TESTS_FOR]->(c);

MATCH (q:Question), (c:Category)
WHERE q.id = 'q-identify-problem' AND c.id IN ['cat-problem-solving', 'cat-impact']
MERGE (q)-[:TESTS_FOR]->(c);

// Create relationships between Questions and Traits
// Leadership Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-leadership-challenge' AND t.id IN ['trait-ownership', 'trait-influence', 'trait-execution']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-influence-without-authority' AND t.id IN ['trait-influence', 'trait-strategic-thinking', 'trait-empathy']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-difficult-decision' AND t.id IN ['trait-analytical-thinking', 'trait-ownership', 'trait-strategic-thinking']
MERGE (q)-[:TESTS_FOR]->(t);

// Teamwork Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-disagreement' AND t.id IN ['trait-collaboration', 'trait-empathy', 'trait-integrity']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-difficult-team-member' AND t.id IN ['trait-resilience', 'trait-collaboration', 'trait-empathy']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-helping-teammate' AND t.id IN ['trait-empathy', 'trait-collaboration', 'trait-initiative']
MERGE (q)-[:TESTS_FOR]->(t);

// Problem Solving Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-complex-technical' AND t.id IN ['trait-analytical-thinking', 'trait-execution', 'trait-creativity']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-debug-under-pressure' AND t.id IN ['trait-analytical-thinking', 'trait-resilience', 'trait-execution']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-unclear-solution' AND t.id IN ['trait-creativity', 'trait-analytical-thinking', 'trait-initiative']
MERGE (q)-[:TESTS_FOR]->(t);

// Communication Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-technical-to-non-technical' AND t.id IN ['trait-empathy', 'trait-influence', 'trait-customer-focus']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-difficult-feedback' AND t.id IN ['trait-integrity', 'trait-empathy', 'trait-influence']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-presentation-issues' AND t.id IN ['trait-adaptability', 'trait-resilience', 'trait-initiative']
MERGE (q)-[:TESTS_FOR]->(t);

// Innovation Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-improve-process' AND t.id IN ['trait-initiative', 'trait-creativity', 'trait-results-oriented']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-creative-solution' AND t.id IN ['trait-creativity', 'trait-analytical-thinking', 'trait-initiative']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-challenge-status-quo' AND t.id IN ['trait-initiative', 'trait-strategic-thinking', 'trait-influence']
MERGE (q)-[:TESTS_FOR]->(t);

// Adversity Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-biggest-failure' AND t.id IN ['trait-resilience', 'trait-humility', 'trait-integrity']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-harsh-criticism' AND t.id IN ['trait-humility', 'trait-adaptability', 'trait-resilience']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-cancelled-project' AND t.id IN ['trait-resilience', 'trait-adaptability', 'trait-empathy']
MERGE (q)-[:TESTS_FOR]->(t);

// Impact Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-proudest-achievement' AND t.id IN ['trait-results-oriented', 'trait-execution', 'trait-ownership']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-exceed-expectations' AND t.id IN ['trait-initiative', 'trait-results-oriented', 'trait-execution']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-business-value' AND t.id IN ['trait-data-driven', 'trait-results-oriented', 'trait-strategic-thinking']
MERGE (q)-[:TESTS_FOR]->(t);

// Growth Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-learn-quickly' AND t.id IN ['trait-adaptability', 'trait-initiative', 'trait-execution']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-mentoring' AND t.id IN ['trait-empathy', 'trait-initiative', 'trait-influence']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-comfort-zone' AND t.id IN ['trait-initiative', 'trait-adaptability', 'trait-humility']
MERGE (q)-[:TESTS_FOR]->(t);

// Cross-Category Questions
MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-competing-priorities' AND t.id IN ['trait-strategic-thinking', 'trait-execution', 'trait-adaptability']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-ambiguous-requirements' AND t.id IN ['trait-adaptability', 'trait-initiative', 'trait-customer-focus']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-pivot-approach' AND t.id IN ['trait-adaptability', 'trait-resilience', 'trait-strategic-thinking']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-tight-deadline' AND t.id IN ['trait-execution', 'trait-ownership', 'trait-results-oriented']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-say-no' AND t.id IN ['trait-integrity', 'trait-strategic-thinking', 'trait-influence']
MERGE (q)-[:TESTS_FOR]->(t);

MATCH (q:Question), (t:Trait)
WHERE q.id = 'q-identify-problem' AND t.id IN ['trait-initiative', 'trait-analytical-thinking', 'trait-ownership']
MERGE (q)-[:TESTS_FOR]->(t); 