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
      name: 'category_name_unique',
      query: 'CREATE CONSTRAINT category_name_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE'
    },
    {
      name: 'trait_name_unique',
      query: 'CREATE CONSTRAINT trait_name_unique IF NOT EXISTS FOR (t:Trait) REQUIRE t.name IS UNIQUE'
    },
    {
      name: 'question_id_unique',
      query: 'CREATE CONSTRAINT question_id_unique IF NOT EXISTS FOR (q:Question) REQUIRE q.id IS UNIQUE'
    }
  ];

  // Create indexes
  const indexes = [
    {
      name: 'story_title_fulltext',
      query: 'CREATE FULLTEXT INDEX story_title_fulltext IF NOT EXISTS FOR (s:Story) ON EACH [s.title]'
    },
    {
      name: 'question_text_fulltext',
      query: 'CREATE FULLTEXT INDEX question_text_fulltext IF NOT EXISTS FOR (q:Question) ON EACH [q.text]'
    }
  ];

  // Execute constraints
  const constraintResults: ConstraintResult[] = [];
  for (const constraint of constraints) {
    try {
      await neo4jConnection.runQuery(constraint.query);
      constraintResults.push({
        name: constraint.name,
        status: 'created'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        constraintResults.push({
          name: constraint.name,
          status: 'already_exists'
        });
      } else {
        constraintResults.push({
          name: constraint.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
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
      if (error instanceof Error && error.message.includes('already exists')) {
        indexResults.push({
          name: index.name,
          status: 'already_exists'
        });
      } else {
        indexResults.push({
          name: index.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Log results
  console.log('\nConstraint Creation Results:');
  constraintResults.forEach(result => {
    if (result.status === 'created') {
      console.log(`✅ Created constraint: ${result.name}`);
    } else if (result.status === 'already_exists') {
      console.log(`ℹ️ Constraint already exists: ${result.name}`);
    } else {
      console.log(`❌ Failed to create constraint ${result.name}: ${result.error}`);
    }
  });

  console.log('\nIndex Creation Results:');
  indexResults.forEach(result => {
    if (result.status === 'created') {
      console.log(`✅ Created index: ${result.name}`);
    } else if (result.status === 'already_exists') {
      console.log(`ℹ️ Index already exists: ${result.name}`);
    } else {
      console.log(`❌ Failed to create index ${result.name}: ${result.error}`);
    }
  });
} 