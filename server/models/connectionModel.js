// models/connectionModel.js
import mongoose from 'mongoose';

const ConnectionSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'accepted' // For simple follow system
  }
}, {
  timestamps: true
});

// Prevent duplicate connections
ConnectionSchema.index({ follower: 1, following: 1 }, { unique: true });

const Connection = mongoose.model('Connection', ConnectionSchema);
export default Connection;