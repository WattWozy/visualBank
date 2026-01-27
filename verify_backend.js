const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function runVerification() {
    const username = `testuser_${Date.now()}`;
    const password = 'password123';

    console.log(`Starting verification for user: ${username}`);

    let token;
    let userId;

    // 1. Register
    try {
        console.log('1. Testing Registration...');
        const res = await axios.post(`${BASE_URL}/auth/register`, { username, password });
        console.log('   Registration Success:', res.status === 200);
        token = res.data.token;
        userId = res.data.user.id;
    } catch (err) {
        console.error('   Registration Failed:', err.response?.data || err.message);
        return;
    }

    // 2. Login (sanity check)
    try {
        console.log('2. Testing Login...');
        const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
        console.log('   Login Success:', res.status === 200);
        token = res.data.token; // Update token just in case
    } catch (err) {
        console.error('   Login Failed:', err.response?.data || err.message);
        return;
    }

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Add Holding
    let holdingId;
    try {
        console.log('3. Testing Add Holding...');
        const res = await axios.post(`${BASE_URL}/data/holdings`, {
            name: 'AAPL',
            value: 10,
            type: 'stock',
            allocation: 50
        }, authHeaders);
        console.log('   Add Holding Success:', res.status === 200);
        holdingId = res.data.id;
    } catch (err) {
        console.error('   Add Holding Failed:', err.response?.data || err.message);
    }

    // 4. Get Holdings
    try {
        console.log('4. Testing Get Holdings...');
        const res = await axios.get(`${BASE_URL}/data/holdings`, authHeaders);
        const added = res.data.find(h => h.name === 'AAPL');
        console.log('   Get Holdings Success:', !!added && added.value === 10);
    } catch (err) {
        console.error('   Get Holdings Failed:', err.response?.data || err.message);
    }

    // 5. Update Holding
    if (holdingId) {
        try {
            console.log('5. Testing Update Holding...');
            await axios.put(`${BASE_URL}/data/holdings/${holdingId}`, {
                name: 'AAPL',
                value: 15,
                type: 'stock',
                allocation: 60
            }, authHeaders);

            // Verify update
            const res = await axios.get(`${BASE_URL}/data/holdings`, authHeaders);
            const updated = res.data.find(h => h.id === holdingId);
            console.log('   Update Holding Success:', updated.value === 15);
        } catch (err) {
            console.error('   Update Holding Failed:', err.response?.data || err.message);
        }
    }

    console.log('Verification Complete.');
}

runVerification();
