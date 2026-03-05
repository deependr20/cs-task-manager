const fs = require('fs');
const path = require('path');

// Create .env.local file with MongoDB connection
const envContent = `# MongoDB Connection String
# IMPORTANT: Replace <db_password> with your actual MongoDB password
MONGODB_URI=mongodb+srv://satyam:<db_password>@deep-dev.d25dubh.mongodb.net/cs-management?retryWrites=true&w=majority

# JWT Secret for authentication (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# Next.js Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Please update it manually with your MongoDB password.');
    console.log('\nRequired variables:');
    console.log('MONGODB_URI=mongodb+srv://satyam:YOUR_PASSWORD@deep-dev.d25dubh.mongodb.net/cs-management?retryWrites=true&w=majority');
    console.log('JWT_SECRET=your-secret-key');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('⚠️  IMPORTANT: Please edit .env.local and replace <db_password> with your actual MongoDB password!');
  }
} catch (error) {
  console.error('Error creating .env.local:', error);
  console.log('\nPlease create .env.local manually with the following content:');
  console.log(envContent);
}
