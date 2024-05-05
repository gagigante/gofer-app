import sqlite3 from 'sqlite3'
import path from 'node:path'

console.log('run')

const db = new sqlite3.Database(`${path.resolve()}/tmp/db.sqlite`)

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, password TEXT)")

  // const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  // for (let i = 0; i < 10; i++) {
  //     stmt.run("Ipsum " + i);
  // }
  // stmt.finalize();

  // db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
  //     console.log(row.id + ": " + row.info);
  // });
});

db.close()

export { db }
