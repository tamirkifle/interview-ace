import { neo4jConnection } from './neo4j';

interface ConstraintResult {
  name: string;
  status: 'created' | 'already_exists' | 'failed';
  error?: string;
}

export async function initializeDatabase(): Promise<void> {
  console.log('Initializing database constraints and indexes...');

  // Create constraints
  const constraints = [
    {
      name: 'story_id_unique',
      query: 'CREATE CONSTRAINT story_id_unique IF NOT EXISTS FOR (s:Story) REQUIRE s.id IS UNIQUE'
    },
    {
      name: 'category_id_unique',
      query: 'CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE'
    },
    {
      name: 'category_name_unique',
      query: 'CREATE CONSTRAINT category_name_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE'
    },
    {
      name: 'trait_id_unique',
      query: 'CREATE CONSTRAINT trait_id_unique IF NOT EXISTS FOR (t:Trait) REQUIRE t.id IS UNIQUE'
    },
    {
      name: 'trait_name_unique',
      query: 'CREATE CONSTRAINT trait_name_unique IF NOT EXISTS FOR (t:Trait) REQUIRE t.name IS UNIQUE'
    },
    {
      name: 'question_id_unique',
      query: 'CREATE CONSTRAINT question_id_unique IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE'
    },
    {
      name: 'recording_id_unique',
      query: 'CREATE CONSTRAINT recording_id_unique IF NOT EXISTS FOR (r:Recording) REQUIRE r.id IS UNIQUE'
    }
  ];

  // Create indexes
  const indexes = [
    // Fulltext indexes (existing)
    {
      name: 'story_title_fulltext',
      query: 'CREATE FULLTEXT INDEX story_title_fulltext IF NOT EXISTS FOR (s:Story) ON EACH [s.title]'
    },
    {
      name: 'question_text_fulltext',
      query: 'CREATE FULLTEXT INDEX question_text_fulltext IF NOT EXISTS FOR (q:Question) ON EACH [q.text]'
    },
    {
      name: 'category_name_fulltext',
      query: 'CREATE FULLTEXT INDEX category_name_fulltext IF NOT EXISTS FOR (c:Category) ON EACH [c.name]'
    },
    {
      name: 'trait_name_fulltext',
      query: 'CREATE FULLTEXT INDEX trait_name_fulltext IF NOT EXISTS FOR (t:Trait) ON EACH [t.name]'
    },
    
    // Performance indexes for story-question matching (simplified for compatibility)
    {
      name: 'story_id_range',
      query: 'CREATE INDEX story_id_range IF NOT EXISTS FOR (s:Story) ON (s.id)'
    },
    {
      name: 'question_id_range', 
      query: 'CREATE INDEX question_id_range IF NOT EXISTS FOR (q:Question) ON (q.id)'
    },
    {
      name: 'category_id_range',
      query: 'CREATE INDEX category_id_range IF NOT EXISTS FOR (c:Category) ON (c.id)'
    },
    {
      name: 'trait_id_range',
      query: 'CREATE INDEX trait_id_range IF NOT EXISTS FOR (t:Trait) ON (t.id)'
    },
    
    // Composite indexes for common query patterns
    {
      name: 'story_composite',
      query: 'CREATE INDEX story_composite IF NOT EXISTS FOR (s:Story) ON (s.id, s.createdAt)'
    },
    {
      name: 'question_composite',
      query: 'CREATE INDEX question_composite IF NOT EXISTS FOR (q:Question) ON (q.id, q.difficulty, q.commonality)'
    },
    
    // Lookup indexes
    {
      name: 'category_lookup',
      query: 'CREATE INDEX category_lookup IF NOT EXISTS FOR (c:Category) ON (c.name, c.id)'
    },
    {
      name: 'trait_lookup',
      query: 'CREATE INDEX trait_lookup IF NOT EXISTS FOR (t:Trait) ON (t.name, t.id)'
    }
  ];

  // Check existing constraints
  const existingConstraints = await neo4jConnection.runQuery(
    'SHOW CONSTRAINTS YIELD name'
  );
  const existingConstraintNames = new Set(
    existingConstraints.records.map(record => record.get('name'))
  );

  // Execute constraints
  const constraintResults: ConstraintResult[] = [];
  for (const constraint of constraints) {
    if (!existingConstraintNames.has(constraint.name)) {
      try {
        await neo4jConnection.runQuery(constraint.query);
        constraintResults.push({
          name: constraint.name,
          status: 'created'
        });
      } catch (error) {
        constraintResults.push({
          name: constraint.name,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      constraintResults.push({
        name: constraint.name,
        status: 'already_exists'
      });
    }
  }

  // Execute indexes
  const indexResults: ConstraintResult[] = [];
  for (const index of indexes) {
    try {
      await neo4jConnection.runQuery(index.query);
      indexResults.push({
        name: index.name,
        status: 'created'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists') || errorMessage.includes('equivalent')) {
        indexResults.push({
          name: index.name,
          status: 'already_exists'
        });
      } else {
        indexResults.push({
          name: index.name,
          status: 'failed',
          error: errorMessage
        });
      }
    }
  }

  // Log results
  console.log('\nConstraint creation results:');
  constraintResults.forEach(result => {
    const status = result.status === 'created' ? '✓' : 
                  result.status === 'already_exists' ? '○' : '✗';
    console.log(`${status} ${result.name}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
  });

  console.log('\nIndex creation results:');
  indexResults.forEach(result => {
    const status = result.status === 'created' ? '✓' : 
                  result.status === 'already_exists' ? '○' : '✗';
    console.log(`${status} ${result.name}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
  });

  console.log('\nDatabase initialization complete!');
}