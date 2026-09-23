const { Client } = require('pg');

async function setup() {
  const passwords = ['', 'postgres', 'admin', 'root'];
  let client = null;
  let workingPassword = null;

  for (const pwd of passwords) {
    try {
      console.log(`Testing connection with postgres user (password: "${pwd}")...`);
      const testClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: pwd,
        port: 5432,
      });
      await testClient.connect();
      console.log(`Success! Password is: "${pwd}"`);
      client = testClient;
      workingPassword = pwd;
      break;
    } catch (e) {
      console.log(`Password "${pwd}" failed: ${e.message}`);
    }
  }

  if (!client) {
    console.error('Could not connect to PostgreSQL with default credentials. Please verify your PostgreSQL service.');
    process.exit(1);
  }

  try {
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'marketfaso'");
    if (res.rowCount === 0) {
      console.log("Database 'marketfaso' does not exist. Creating it now...");
      await client.query("CREATE DATABASE marketfaso");
      console.log("Database 'marketfaso' created successfully!");
    } else {
      console.log("Database 'marketfaso' already exists.");
    }
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

setup();
