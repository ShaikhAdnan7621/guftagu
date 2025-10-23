import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
	chat: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'chats',
		required: true
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	content: {
		type: String,
		required: true,
		trim: true
	},
	messageType: {
		type: String,
		enum: ['text', 'image', 'file'],
		default: 'text'
	},
	replyTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'messages',
		default: null
	},
	reactions: [{
		emoji: {
			type: String,
			required: true
		},
		users: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		}]
	}],

	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	version: {
		type: Number,
		default: 1
	}
});


export default mongoose.models?.messages || mongoose.model("messages", messageSchema);