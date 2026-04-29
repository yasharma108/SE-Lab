const db = require('./config/db');

async function check() {
    try {
        const [users] = await db.query('SELECT * FROM users');
        console.log("Users:", users);
        if (users.length > 0) {
            const bcrypt = require('bcrypt');
            const match = await bcrypt.compare('Admin@123', users[0].password_hash);
            console.log("Does Admin@123 match hash?", match);
        }
    } catch(err) {
        console.error(err);
    }
    process.exit();
}
check();
