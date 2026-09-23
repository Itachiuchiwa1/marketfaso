const { execSync } = require('child_process');
const path = require('path');

const nodeDir = 'C:\\Program Files\\nodejs';
const env = {
  ...process.env,
  PATH: `${nodeDir};${process.env.PATH || ''}`
};

console.log('Installing dependencies...');
execSync('npm install prisma @prisma/client @prisma/adapter-pg pg dotenv next-auth@beta bcryptjs zod lucide-react clsx', {
  cwd: __dirname,
  stdio: 'inherit',
  env
});

console.log('Installing dev dependencies...');
execSync('npm install -D @types/pg tsx @types/bcryptjs', {
  cwd: __dirname,
  stdio: 'inherit',
  env
});

console.log('Dependencies installation completed successfully!');
