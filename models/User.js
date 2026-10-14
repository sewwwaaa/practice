import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    default: 'Cyber Command'
  },
  role: {
    type: String,
    default: 'Certified Operator'
  },
  status: {
    type: String,
    default: 'Active'
  },
  clearance: {
    type: String,
    default: 'LEVEL-5 TOP SECRET'
  },
  lastLogin: {
    type: String,
    default: 'Just now'
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
