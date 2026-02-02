/**
 * Frontend Diagnostics for AGHAMazingQuestCMS
 * This script helps identify issues with the frontend functionality
 */

const fs = require('fs');
const path = require('path');

// Check for essential files
const projectDir = '/home/apcadmin/Documents/GitHub/MCSPROJ_AGHAMazingQuestCMS/frontend';
const srcDir = path.join(projectDir, 'src');

console.log('🔍 Frontend Diagnostics for AGHAMazingQuestCMS\n');

// 1. Check essential files
const essentialFiles = [
  'package.json',
  'src/index.js',
  'src/App.jsx',
  'src/api/django-api.js',
  'src/pages/UserManagementPage.jsx',
  'src/components/UserForm.jsx'
];

console.log('📁 Checking essential files...');
essentialFiles.forEach(file => {
  const filePath = path.join(projectDir, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Check for route definitions
const appJsPath = path.join(srcDir, 'App.jsx');
if (fs.existsSync(appJsPath)) {
  const appContent = fs.readFileSync(appJsPath, 'utf8');
  
  console.log('\n🗺️  Checking route definitions...');
  const routes = [
    { name: 'User Management', pattern: /UserManagementPage/ },
    { name: 'Content Management', pattern: /ContentListPage|UploadContentPage/ },
    { name: 'Analytics', pattern: /AnalyticsManagementPage/ }
  ];
  
  routes.forEach(route => {
    const found = route.pattern.test(appContent);
    console.log(`  ${found ? '✅' : '❌'} ${route.name} route`);
  });
}

// 3. Check for API integration
const apiServicePath = path.join(srcDir, 'api/django-api.js');
if (fs.existsSync(apiServicePath)) {
  const apiContent = fs.readFileSync(apiServicePath, 'utf8');
  
  console.log('\n📡 Checking API service...');
  const apiFunctions = [
    { name: 'signInWithEmail', pattern: /signInWithEmail/ },
    { name: 'signUpWithEmail', pattern: /signUpWithEmail/ },
    { name: 'getContentItems', pattern: /getContentItems/ },
    { name: 'createContentItem', pattern: /createContentItem/ },
    { name: 'getCurrentUser', pattern: /getCurrentUser/ }
  ];
  
  apiFunctions.forEach(func => {
    const found = func.pattern.test(apiContent);
    console.log(`  ${found ? '✅' : '❌'} ${func.name}`);
  });
}

// 4. Check for User Management components
const userManagementPath = path.join(srcDir, 'pages/UserManagementPage.jsx');
if (fs.existsSync(userManagementPath)) {
  const userContent = fs.readFileSync(userManagementPath, 'utf8');
  
  console.log('\n👥 Checking User Management page...');
  const userFeatures = [
    { name: 'User listing', pattern: /UserTable|user.*list|table.*user/i },
    { name: 'User creation', pattern: /add.*user|create.*user|new.*user/i },
    { name: 'User editing', pattern: /edit.*user|update.*user/i },
    { name: 'User deletion', pattern: /delete.*user|remove.*user/i }
  ];
  
  userFeatures.forEach(feature => {
    const found = feature.pattern.test(userContent);
    console.log(`  ${found ? '✅' : '❌'} ${feature.name}`);
  });
} else {
  console.log('\n❌ UserManagementPage.jsx not found');
}

// 5. Check for environment configuration
const envPath = path.join(projectDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n⚙️  Checking environment configuration...');
  
  const hasBackendUrl = /REACT_APP_BACKEND_API_URL/.test(envContent);
  console.log(`  ${hasBackendUrl ? '✅' : '❌'} Backend API URL configured`);
  
  if (hasBackendUrl) {
    const apiUrlMatch = envContent.match(/REACT_APP_BACKEND_API_URL=(.*)/);
    if (apiUrlMatch) {
      console.log(`     API URL: ${apiUrlMatch[1]}`);
    }
  }
} else {
  console.log('\n❌ .env file not found');
}

// 6. Check for error boundaries or fallback components
console.log('\n🛡️  Checking for error handling...');
const filesToCheck = [
  'src/App.jsx',
  'src/index.js',
  'src/Dashboard.jsx',
  'src/SignInScreen.jsx'
];

let hasErrorBoundary = false;
filesToCheck.forEach(file => {
  const filePath = path.join(srcDir, file.replace('src/', ''));
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (/ErrorBoundary|error.*boundary/i.test(content)) {
      console.log(`  ✅ Error boundary found in ${file}`);
      hasErrorBoundary = true;
    }
  }
});

if (!hasErrorBoundary) {
  console.log('  ❌ No error boundaries found');
}

// 7. Check for common React patterns that might cause issues
console.log('\n⚛️  Checking for common React issues...');
const jsxFiles = fs.readdirSync(path.join(srcDir)).filter(f => f.endsWith('.jsx'));

jsxFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for missing imports
  const potentialIssues = [];
  if (/(useState|useEffect|useContext)/.test(content) && !/import.*React.*from/.test(content)) {
    potentialIssues.push('Missing React hooks import');
  }
  if (/(useParams|useNavigate|useLocation)/.test(content) && !/import.*react-router-dom/.test(content)) {
    potentialIssues.push('Missing react-router-dom import');
  }
  
  if (potentialIssues.length > 0) {
    console.log(`  ⚠️  ${file}:`);
    potentialIssues.forEach(issue => console.log(`    - ${issue}`));
  }
});

console.log('\n📋 Diagnostic complete. Review the results above to identify issues.');
console.log('\n💡 Recommended next steps:');
console.log('   1. Fix any missing essential files');
console.log('   2. Verify API service integration');
console.log('   3. Implement missing User Management functionality');
console.log('   4. Add error boundaries for better error handling');
console.log('   5. Test all routes and components');