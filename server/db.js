const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Funds/Holdings table
    // Storing simple portfolio items
    db.run(`CREATE TABLE IF NOT EXISTS holdings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        value REAL,
        type TEXT,
        allocation REAL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Goals table
    db.run(`CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        targetAmount REAL,
        currentAmount REAL,
        deadline TEXT,
        priority TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Optimization/Stats table (optional, for dashboard state)
    db.run(`CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY,
        risk_tolerance TEXT,
        investment_horizon TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

module.exports = db;
