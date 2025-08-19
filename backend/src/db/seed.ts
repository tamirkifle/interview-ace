import { neo4jConnection } from './neo4j';
import * as fs from 'fs';
import * as path from 'path';
import { ManagedTransaction } from 'neo4j-driver';

async function seedDatabase() {
  const session = await neo4jConnection.getSession();
  console.log('Starting database seeding...');

  try {
    // Read the seed file
    const seedPath = path.join(__dirname, 'queries', 'seed.cypher');
    const seedContent = fs.readFileSync(seedPath, 'utf8');

    // Split into individual commands
    const commands = seedContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`Found ${commands.length} commands to execute`);

    // Execute each command in a transaction
    await session.executeWrite((tx: ManagedTransaction) => {
      return Promise.all(
        commands.map(async (command, index) => {
          try {
            const result = await tx.run(command);
            console.log(`✓ Executed command ${index + 1}/${commands.length}`);
            return result;
          } catch (error: unknown) {
            console.error(`✗ Error executing command ${index + 1}/${commands.length}:`);
            console.error(`Command: ${command}`);
            console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
          }
        })
      );
    });

    // Verify the data
    const verificationQueries = [
      {
        name: 'Categories',
        query: 'MATCH (c:Category) RETURN count(c) as count',
        expected: 8
      },
      {
        name: 'Traits',
        query: 'MATCH (t:Trait) RETURN count(t) as count',
        expected: 16
      },
      {
        name: 'Questions',
        query: 'MATCH (q:Question) RETURN count(q) as count',
        expected: 30
      },
      {
        name: 'Question-Category Relationships',
        query: 'MATCH (q:Question)-[:TESTS_FOR]->(c:Category) RETURN count(*) as count',
        expected: 60 // Each question has 2 categories
      },
      {
        name: 'Question-Trait Relationships',
        query: 'MATCH (q:Question)-[:TESTS_FOR]->(t:Trait) RETURN count(*) as count',
        expected: 90 // Each question has 3 traits
      }
    ];

    console.log('\nVerifying data...');
    for (const verification of verificationQueries) {
      const result = await session.executeRead((tx: ManagedTransaction) => 
        tx.run(verification.query)
      );
      const count = Number(result.records[0].get('count'));
      const status = count === verification.expected ? '✓' : '✗';
      console.log(`${status} ${verification.name}: ${count}/${verification.expected}`);
    }

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await session.close();
    await neo4jConnection.close();
    process.exit(0);
  }
}

// Run the seed function
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 