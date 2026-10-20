const { Client } = require('pg');

async function testConn() {
  const hosts = ['127.0.0.1', 'localhost'];
  const passwords = ['postgres', 'admin', 'root', '123456', 'postgres123', 'root123', 'marketfaso', 'password', '1234', '0000', 'admin123', '12345678', ''];
  
  for (const host of hosts) {
    for (const pwd of passwords) {
      try {
        const client = new Client({
          user: 'postgres',
          host: host,
          database: 'postgres',
          password: pwd,
          port: 5432,
          connectionTimeoutMillis: 1000
        });
        await client.connect();
        console.log(`SUCCESS! Host: ${host}, Password: "${pwd}"`);
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'marketfaso'");
        if (res.rowCount === 0) {
          await client.query("CREATE DATABASE marketfaso");
          console.log("Database 'marketfaso' created successfully!");
        } else {
          console.log("Database 'marketfaso' already exists.");
        }
        await client.end();
        return { host, pwd };
      } catch (e) {
        // failed connection or password
      }
    }
  }
  console.log("All host & password attempts failed.");
}

testConn();
