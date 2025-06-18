// Script de test pour vérifier l'API
// Usage: node test-api.js

const baseUrl = process.env.API_URL || 'http://localhost:3000';

async function testEndpoint(path, name) {
  console.log(`\n📍 Testing ${name}...`);
  try {
    const response = await fetch(`${baseUrl}${path}`);
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log('📊 Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log(`🔧 Testing API at ${baseUrl}`);
  console.log('=' .repeat(50));
  
  // Test des dépendances
  await testEndpoint('/api/test-dependencies', 'Dependencies Check');
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Tests completed');
  console.log('\nPour tester sur Vercel, utilisez:');
  console.log('API_URL=https://votre-app.vercel.app node test-api.js');
}

runTests(); 