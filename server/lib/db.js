import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function initDb() {
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "france.db");
  db = new sqlite3.Database(dbPath);

  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await run("PRAGMA foreign_keys = ON;");
  await run("PRAGMA journal_mode = WAL;");
  await run("PRAGMA synchronous = NORMAL;");

  const statements = schema.split(";").map(s => s.trim()).filter(Boolean);
  for (const st of statements) await run(st + ";");

  console.log("DB init OK:", dbPath);
}

export function dbRun(sql, params = []) { return run(sql, params); }
export function dbGet(sql, params = []) { return get(sql, params); }
