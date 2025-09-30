// account_system.js
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const crypto = require('crypto');
function hashPassword(password) { return crypto.createHash('sha256').update(password).digest('hex'); }
const db = new sqlite3.Database('accounts.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, email TEXT, is_admin INTEGER DEFAULT 0)`);
  db.get("SELECT COUNT(*) as cnt FROM accounts WHERE username = 'asiadmin'", (err, row) => {
    if (!row || row.cnt === 0) {
      db.run("INSERT INTO accounts (username, password, email, is_admin) VALUES (?, ?, ?, 1)",
        ["asiadmin", hashPassword("passasinomi"), "admin@example.com"]);
      console.log("✅ Админ-аккаунт создан (asiadmin / passasinomi)");
    }
  });
});
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(question) { return new Promise(resolve => rl.question(question, answer => resolve(answer))); }
async function main() {
  console.log("🔐 Вход администратора");
  const login = await ask("Логин: ");
  const pass = await ask("Пароль: ");
  db.get("SELECT password, is_admin FROM accounts WHERE username = ?", [login], async (err, row) => {
    if (row && row.password === hashPassword(pass) && row.is_admin) {
      console.log("✅ Вход выполнен как администратор.");
      while (true) {
        console.log("\\nМеню:\\n1. Добавить пользователя\\n2. Список пользователей\\n3. Удалить пользователя\\n4. Сменить пароль админа\\n5. Выход");
        const choice = await ask("Ваш выбор: ");
        if (choice === "1") {
          const u = await ask("Логин: "); const p = await ask("Пароль: "); const e = await ask("Email: ");
          db.run("INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)", [u, hashPassword(p), e], function (err) {
            if (err) console.log("❌ Ошибка: логин занят."); else console.log("✅ Пользователь добавлен.");
          });
        } else if (choice === "2") {
          db.all("SELECT id, username, email, is_admin FROM accounts", [], (err, rows) => {
            console.log("📋 Список аккаунтов:"); rows.forEach(r => { console.log(`${r.id} | ${r.username} | ${r.email || ""} | ${r.is_admin ? "ADMIN" : "USER"}`); });
          });
        } else if (choice === "3") {
          const u = await ask("Логин для удаления: "); db.run("DELETE FROM accounts WHERE username = ? AND is_admin = 0", [u], function(err) {
            if (this && this.changes>0) console.log("✅ Удалено"); else console.log("❌ Не найден или это админ");
          });
        } else if (choice === "4") {
          const np = await ask("Новый пароль админа: "); db.run("UPDATE accounts SET password = ? WHERE username = 'asiadmin'", [hashPassword(np)], function(err){ console.log("✅ Пароль обновлён"); });
        } else if (choice === "5") { console.log("👋 Выход"); rl.close(); db.close(); break; } else { console.log("❌ Неверный выбор"); }
      }
    } else { console.log("❌ Ошибка входа. Доступ только админу."); rl.close(); db.close(); }
  });
}
main();