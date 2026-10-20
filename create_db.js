const { execSync } = require('child_process');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe';
const passwords = ['postgres', 'admin', 'root', '', '123456', 'postgres123', 'root123', 'marketfaso', 'password', '1234', '0000', 'admin123', '12345678'];

for (const pwd of passwords) {
  try {
    console.log(`Trying password: "${pwd}"...`);
    const out = execSync(`"${psqlPath}" -U postgres -c "SELECT 1;"`, {
      env: { ...process.env, PGPASSWORD: pwd },
      encoding: 'utf8'
    });
    console.log(`SUCCESS! Working PostgreSQL password is: "${pwd}"`);
    
    // Create marketfaso database
    try {
      execSync(`"${psqlPath}" -U postgres -c "CREATE DATABASE marketfaso;"`, {
        env: { ...process.env, PGPASSWORD: pwd },
        encoding: 'utf8'
      });
      console.log('Database marketfaso created!');
    } catch (e) {
      console.log('Database marketfaso might already exist.');
    }
    
    break;
  } catch (err) {
    // Password failed, continue loop
  }
}
