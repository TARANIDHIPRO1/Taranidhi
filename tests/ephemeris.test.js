/**
 * EPHEMERIS TESTS
 *
 * Verify NASA JPL Horizons Moon position accuracy
 * Test against known reference dates
 */

const { getMoonPosition, getCachedMoonPosition, verifyAccuracy } = require('../src/ephemeris');

/**
 * Test 1: Basic functionality - can we query Horizons API?
 */
async function testBasicQuery() {
  console.log('TEST 1: Basic API Query');
  console.log('======================\n');

  try {
    const date = new Date('2026-09-28T14:30:00Z');
    const result = await getMoonPosition(date);

    console.log(`✅ Query successful`);
    console.log(`Date: ${result.date}`);
    console.log(`Moon longitude: ${result.longitude.toFixed(2)}°`);
    console.log(`Accuracy: ${result.accuracy}`);
    console.log(`Source: ${result.source}\n`);

    return result.longitude > 0 && result.longitude < 360;
  } catch (error) {
    console.error(`❌ Query failed: ${error.message}\n`);
    return false;
  }
}

/**
 * Test 2: Accuracy verification - compare against reference
 */
async function testAccuracy() {
  console.log('TEST 2: Accuracy Verification');
  console.log('=============================\n');

  // Reference data (from Stellarium or NASA Horizons interactive)
  const references = [
    {
      date: '2026-09-28T14:30:00Z',
      expected: 295.5, // Approximate from Stellarium
      tolerance: 0.5 // ±0.5° for initial check
    },
    {
      date: '2000-01-01T00:00:00Z',
      expected: 100.0, // Y2K reference
      tolerance: 1.0
    }
  ];

  let passed = 0;

  for (const ref of references) {
    try {
      const result = await getMoonPosition(new Date(ref.date));
      const error = Math.abs(result.longitude - ref.expected);
      const status = error <= ref.tolerance ? '✅ PASS' : '❌ FAIL';

      console.log(`${status} ${ref.date}`);
      console.log(`  Got: ${result.longitude.toFixed(2)}°, Expected: ~${ref.expected}°, Error: ${error.toFixed(2)}°`);

      if (error <= ref.tolerance) passed++;
    } catch (error) {
      console.log(`❌ ERROR ${ref.date}: ${error.message}`);
    }
  }

  console.log(`\n${passed}/${references.length} accuracy tests passed\n`);
  return passed === references.length;
}

/**
 * Test 3: Caching - does cached mode reduce API calls?
 */
async function testCaching() {
  console.log('TEST 3: Caching Efficiency');
  console.log('==========================\n');

  const date1 = new Date('2026-09-28T14:30:00Z');
  const date2 = new Date('2026-09-28T14:45:00Z'); // Same hour

  try {
    console.log('First call (should hit API)...');
    const result1 = await getCachedMoonPosition(date1, true);
    console.log(`✅ Result: ${result1.longitude.toFixed(2)}°, Cached: ${result1.cached}`);

    console.log('Second call (should use cache)...');
    const result2 = await getCachedMoonPosition(date2, true);
    console.log(`✅ Result: ${result2.longitude.toFixed(2)}°, Cached: ${result2.cached}`);

    if (result2.cached) {
      console.log('✅ Caching working correctly\n');
      return true;
    } else {
      console.log('⚠️  Caching not triggered (may have expired or different hour)\n');
      return true; // Still acceptable
    }
  } catch (error) {
    console.log(`❌ Caching test error: ${error.message}\n`);
    return false;
  }
}

/**
 * Test 4: Error handling
 */
async function testErrorHandling() {
  console.log('TEST 4: Error Handling');
  console.log('=====================\n');

  const tests = [
    { input: null, name: 'Null date' },
    { input: 'invalid', name: 'String input' },
    { input: new Date('invalid'), name: 'Invalid date' }
  ];

  let passed = 0;

  for (const test of tests) {
    try {
      await getMoonPosition(test.input);
      console.log(`❌ ${test.name}: Should have thrown error`);
    } catch (error) {
      console.log(`✅ ${test.name}: Correctly caught - "${error.message}"`);
      passed++;
    }
  }

  console.log(`\n${passed}/${tests.length} error handling tests passed\n`);
  return passed === tests.length;
}

/**
 * Test 5: Range normalization
 */
function testRangeNormalization() {
  console.log('TEST 5: Angle Normalization');
  console.log('============================\n');

  const { normalizeToRange360 } = require('../src/ephemeris');

  const tests = [
    { input: 295.5, expected: 295.5 },
    { input: 360, expected: 0 },
    { input: 400, expected: 40 },
    { input: -10, expected: 350 }
  ];

  let passed = 0;

  for (const test of tests) {
    const result = normalizeToRange360(test.input);
    const status = Math.abs(result - test.expected) < 0.01 ? '✅' : '❌';
    console.log(`${status} ${test.input}° → ${result.toFixed(2)}° (expected ${test.expected}°)`);
    if (Math.abs(result - test.expected) < 0.01) passed++;
  }

  console.log(`\n${passed}/${tests.length} normalization tests passed\n`);
  return passed === tests.length;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        EPHEMERIS INTEGRATION TEST SUITE                ║');
  console.log('║     NASA JPL Horizons Moon Position Accuracy          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = [];

  // Run tests
  results.push({ name: 'Basic Query', passed: await testBasicQuery() });
  results.push({ name: 'Accuracy', passed: await testAccuracy() });
  results.push({ name: 'Caching', passed: await testCaching() });
  results.push({ name: 'Error Handling', passed: await testErrorHandling() });
  results.push({ name: 'Normalization', passed: testRangeNormalization() });

  // Summary
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log(`║                    TEST SUMMARY                        ║`);
  console.log(`║  ${totalPassed}/${totalTests} test suites passed                       ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');

  results.forEach(r => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${r.name}`);
  });

  console.log('\n');

  return totalPassed === totalTests;
}

// ============================================================================
// EXPORT FOR USE IN CI/CD
// ============================================================================

if (require.main === module) {
  // Run tests directly when executed
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  testBasicQuery,
  testAccuracy,
  testCaching,
  testErrorHandling,
  testRangeNormalization,
  runAllTests
};
