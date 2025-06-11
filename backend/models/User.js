const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
   },
   email: {
      type: String,
      required: false, // Make email optional for customers
      unique: true,
      sparse: true, // Allow multiple null values with unique index
      trim: true,
      lowercase: true,
      match: [
         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
         'Please provide a valid email',
      ],
   },
   phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
   },
   role: {
      type: String,
      enum: ['admin', 'receptionist', 'customer'],
      default: 'customer',
   },
   address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
   },
   // Additional fields for customer profile
   preferredServices: [String],
   notes: String,
   // Fields for tracking user status
   isActive: {
      type: Boolean,
      default: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   lastLogin: Date,
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
   // Only hash the password if it's modified (or new)
   if (!this.isModified('password')) return next();

   try {
      // Generate salt and hash password
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
   } catch (error) {
      next(error);
   }
});

// Method to check if entered password is correct
userSchema.methods.comparePassword = async function (candidatePassword) {
   return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
