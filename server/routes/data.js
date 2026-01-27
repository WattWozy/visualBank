const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const SECRET_KEY = 'visual-bank-secret-key';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

router.use(verifyToken);

// Get User Data (Holdings)
router.get('/holdings', (req, res) => {
    db.all(`SELECT * FROM holdings WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add/Update Holdings (Simplification: Delete all and re-insert for now, or just add one)
// Let's implement getting and saving specific items for flexibility
router.post('/holdings', (req, res) => {
    const { name, value, type, allocation } = req.body;
    db.run(`INSERT INTO holdings (user_id, name, value, type, allocation) VALUES (?, ?, ?, ?, ?)`,
        [req.userId, name, value, type, allocation],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, ...req.body });
        }
    );
});

// Update a holding
router.put('/holdings/:id', (req, res) => {
    const { name, value, type, allocation } = req.body;
    db.run(`UPDATE holdings SET name = ?, value = ?, type = ?, allocation = ? WHERE id = ? AND user_id = ?`,
        [name, value, type, allocation, req.params.id, req.userId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Updated successfully' });
        }
    );
});

// Delete a holding
router.delete('/holdings/:id', (req, res) => {
    db.run(`DELETE FROM holdings WHERE id = ? AND user_id = ?`, [req.params.id, req.userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
});

// Goals
router.get('/goals', (req, res) => {
    db.all(`SELECT * FROM goals WHERE user_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/goals', (req, res) => {
    const { name, targetAmount, currentAmount, deadline, priority } = req.body;
    db.run(`INSERT INTO goals (user_id, name, targetAmount, currentAmount, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.userId, name, targetAmount, currentAmount, deadline, priority],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, ...req.body });
        }
    );
});

module.exports = router;
