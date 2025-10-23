import mongoose from 'mongoose';

const chatRequestSchema = new mongoose.Schema({
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'accepted', 'rejected'],
		default: 'pending'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

export default mongoose.models?.chatrequests || mongoose.model("chatrequests", chatRequestSchema);