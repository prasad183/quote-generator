/**
 * Test script to verify MongoDB connection and functionality
 * Run this script with: node test-mongodb-connection.js
 */

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, path, body = null, description) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (response.ok) {
      log(`✓ ${description}`, 'green');
      return { success: true, data, status: response.status };
    } else {
      log(`✗ ${description} - Status: ${response.status}`, 'red');
      log(`  Error: ${data.error || JSON.stringify(data)}`, 'red');
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log(`✗ ${description} - Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n=== MongoDB Connection & Functionality Test ===\n', 'cyan');

  // Test 1: Check if server is running
  log('1. Checking if server is running...', 'blue');
  const serverCheck = await testEndpoint('GET', '/api/quote', null, 'Server is running');
  if (!serverCheck.success) {
    log('\n❌ Server is not running. Please start the dev server with: npm run dev\n', 'red');
    process.exit(1);
  }

  // Test 2: Check database status (this will attempt MongoDB connection)
  log('\n2. Checking MongoDB connection and database status...', 'blue');
  const dbStatus = await testEndpoint('GET', '/api/migrate/database', null, 'Database status check');
  
  if (!dbStatus.success) {
    log('\n⚠️  MongoDB connection failed. Make sure:', 'yellow');
    log('   - MongoDB is installed and running', 'yellow');
    log('   - ENABLE_MONGODB=true is set in .env.local', 'yellow');
    log('   - MONGODB_URI is set correctly in .env.local', 'yellow');
    log('   - Example: MONGODB_URI=mongodb://localhost:27017/quote-generator\n', 'yellow');
  } else {
    log('\n✅ MongoDB connection successful!', 'green');
    if (dbStatus.data && dbStatus.data.status) {
      log('\nDatabase Collections:', 'cyan');
      Object.entries(dbStatus.data.status.collections).forEach(([name, info]) => {
        if (info.exists) {
          log(`  ${name}: ${info.documentCount} documents`, 'green');
        } else {
          log(`  ${name}: Not found`, 'yellow');
        }
      });
    }
  }

  // Test 3: Run database migration
  log('\n3. Running database migration...', 'blue');
  const migration = await testEndpoint('POST', '/api/migrate/database', null, 'Database migration');
  if (migration.success && migration.data) {
    log(`  Users updated: ${migration.data.results?.usersUpdated || 0}`, 'cyan');
    log(`  Collections updated: ${migration.data.results?.collectionsUpdated || 0}`, 'cyan');
    log(`  Indexes created: ${migration.data.results?.indexesCreated ? 'Yes' : 'No'}`, 'cyan');
  }

  // Test 4: Migrate quotes
  log('\n4. Migrating quotes to MongoDB...', 'blue');
  const quotesMigration = await testEndpoint('POST', '/api/migrate/quotes', null, 'Quotes migration');
  if (quotesMigration.success && quotesMigration.data) {
    log(`  Imported: ${quotesMigration.data.imported || 0}`, 'cyan');
    log(`  Skipped: ${quotesMigration.data.skipped || 0}`, 'cyan');
    log(`  Errors: ${quotesMigration.data.errors?.length || 0}`, 'cyan');
  }

  // Test 5: Test quote endpoints
  log('\n5. Testing quote endpoints...', 'blue');
  await testEndpoint('GET', '/api/quote', null, 'Get random quote');
  await testEndpoint('GET', '/api/quotes?limit=5', null, 'Get quotes list');
  await testEndpoint('GET', '/api/quotes/1', null, 'Get quote by ID');
  await testEndpoint('GET', '/api/quotes/search?q=motivation&limit=5', null, 'Search quotes');

  // Test 6: Test authors endpoint
  log('\n6. Testing authors endpoint...', 'blue');
  await testEndpoint('GET', '/api/authors', null, 'Get authors list');

  // Test 7: Test stats endpoint
  log('\n7. Testing stats endpoint...', 'blue');
  await testEndpoint('GET', '/api/stats', null, 'Get statistics');

  // Test 8: Test collections endpoints
  log('\n8. Testing collections endpoints...', 'blue');
  await testEndpoint('GET', '/api/collections', null, 'Get all collections');
  
  // Create a test collection
  const createCollection = await testEndpoint(
    'POST',
    '/api/collections',
    { name: 'Test Collection ' + Date.now() },
    'Create collection'
  );

  // Test 9: Test user registration (if MongoDB is connected)
  log('\n9. Testing user registration...', 'blue');
  const testUsername = 'testuser' + Date.now();
  await testEndpoint(
    'POST',
    '/api/auth/register',
    {
      name: 'Test User',
      username: testUsername,
      password: 'testpass123'
    },
    'User registration'
  );

  // Test 10: Test user login
  log('\n10. Testing user login...', 'blue');
  await testEndpoint(
    'POST',
    '/api/auth/login',
    {
      username: testUsername,
      password: 'testpass123'
    },
    'User login'
  );

  log('\n=== Test Summary ===', 'cyan');
  log('All tests completed! Check the results above.\n', 'green');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test script error: ${error.message}`, 'red');
  process.exit(1);
});

