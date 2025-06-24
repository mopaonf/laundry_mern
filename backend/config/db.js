const mongoose = require('mongoose');

const connectDB = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
   } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      // Don't exit the process immediately to allow the server to start anyway
      // This way we can at least test API routes even if the DB is down
      return null;
   }
};

module.exports = connectDB;
