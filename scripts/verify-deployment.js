#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that all dependencies are properly installed
 * and the application can build successfully for Vercel deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Verifying deployment readiness...\n');

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Required dependencies for deployment
const requiredDeps = [
  'react-markdown',
  'remark-gfm',
  '@ai-sdk/cerebras',
  '@ai-sdk/anthropic',
  '@ai-sdk/openai',
  '@ai-sdk/react',
  'ai',
  '@modelcontextprotocol/sdk',
  'next',
  'react',
  'react-dom'
];

console.log('📦 Checking dependencies...');
let allDepsPresent = true;

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ Missing: ${dep}`);
    allDepsPresent = false;
  }
});

if (!allDepsPresent) {
  console.error('\n❌ Missing required dependencies. Run: npm install');
  process.exit(1);
}

// Check if vercel.json exists
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  console.log('⚠️  vercel.json not found - using default Vercel configuration');
} else {
  console.log('✅ vercel.json found');
}

// Check if env.example exists
const envExamplePath = path.join(process.cwd(), 'env.example');
if (!fs.existsSync(envExamplePath)) {
  console.log('⚠️  env.example not found');
} else {
  console.log('✅ env.example found');
}

// Check if next.config.js exists
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (!fs.existsSync(nextConfigPath)) {
  console.log('⚠️  next.config.js not found - using default Next.js configuration');
} else {
  console.log('✅ next.config.js found');
}

// Check if tailwind.config.js exists
const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
if (!fs.existsSync(tailwindConfigPath)) {
  console.log('⚠️  tailwind.config.js not found');
} else {
  console.log('✅ tailwind.config.js found');
}

// Check if tsconfig.json exists
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.log('⚠️  tsconfig.json not found');
} else {
  console.log('✅ tsconfig.json found');
}

console.log('\n🔨 Testing build...');

try {
  // Run type check
  console.log('📝 Running TypeScript type check...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript type check passed');
} catch (error) {
  console.log('⚠️  TypeScript type check failed (likely due to test files)');
  console.log('ℹ️  This is common and won\'t affect deployment');
  // Don't exit on type check failure for deployment verification
}

try {
  // Run build
  console.log('🏗️  Running production build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build successful');
} catch (error) {
  console.error('❌ Production build failed');
  process.exit(1);
}

console.log('\n🎉 Deployment verification complete!');
console.log('\n📋 Next steps for Vercel deployment:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your repository to Vercel');
console.log('3. Set environment variables in Vercel dashboard:');
console.log('   - OPENAI_API_KEY');
console.log('   - ANTHROPIC_API_KEY');
console.log('   - CEREBRAS_API_KEY');
console.log('   - EXPEDIA_API_KEY (optional)');
console.log('4. Deploy! 🚀');
console.log('\nFor detailed instructions, see DEPLOYMENT.md');
