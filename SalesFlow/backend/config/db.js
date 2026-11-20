const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salesflow';

    // Auto-clean common copy-paste artifacts (angle brackets, backticks, or trailing spaces around user/password)
    const srvMatch = mongoUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (srvMatch) {
      const protocol = srvMatch[1];
      const rawUser = srvMatch[2];
      const rawPass = srvMatch[3];
      const rest = srvMatch[4];

      const cleanUser = rawUser.replace(/^[<`\s]+|[>`\s]+$/g, '').trim();
      const cleanPass = rawPass.replace(/^[<`\s]+|[>`\s]+$/g, '').trim();

      if (cleanUser !== rawUser || cleanPass !== rawPass) {
        console.log('Sanitizing MONGO_URI: Removed placeholder brackets/backticks from credentials.');
        mongoUri = `${protocol}${cleanUser}:${encodeURIComponent(cleanPass)}@${rest}`;
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'salesflow',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
