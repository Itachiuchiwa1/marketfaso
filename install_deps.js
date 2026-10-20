const { execSync } = require('child_process');

const nodeDir = 'C:\\Program Files\\nodejs';
const env = {
  ...process.env,
  PATH: `${nodeDir};${process.env.PATH || ''}`
};

console.log('Installing dependencies with --legacy-peer-deps...');
execSync('npm install --legacy-peer-deps', {
  cwd: __dirname,
  stdio: 'inherit',
  env
});

console.log('Dependencies installation completed successfully!');
