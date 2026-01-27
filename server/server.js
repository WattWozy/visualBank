const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.get('/', (req, res) => {
    res.send('Visual Bank API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
