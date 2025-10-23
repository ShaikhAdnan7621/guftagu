import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
	passkey: {
		type: String,
		unique: true
	},
	shareableKey: {
		key: String,
		expiresAt: Date,
		isActive: {
			type: Boolean,
			default: true
		}
	},
	chattedWith: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users'
	}],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	lastActive: {
		type: Date,
		default: Date.now
	},
	lastSeen: {
		type: Date,
		default: Date.now
	},
	isOnline: {
		type: Boolean,
		default: false
	}
});

// Create the model
export default mongoose.models?.users || mongoose.model("users", userSchema);

