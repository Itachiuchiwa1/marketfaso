const { execSync } = require('child_process');

const nodeDir = 'C:\\Program Files\\nodejs';
const env = {
  ...process.env,
  PATH: `${nodeDir};${process.env.PATH || ''}`
};

try {
  console.log('Generating Prisma Client (Prisma 7)...');
  execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit', env });
  console.log('Prisma generate completed successfully!');
} catch (err) {
  console.error('Prisma generate error:', err);
  process.exit(1);
}
