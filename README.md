
# GuftaGu - Real-Time Chat App

GuftaGu is a modern, secure, real-time chat application built with Next.js, React, MongoDB, and TailwindCSS. Connect instantly with friends using unique shareable keys, chat in real-time, and enjoy a beautiful, responsive UI.

## Features

- **Authentication:** Sign up, log in (password or passkey), and recover forgotten passkeys.
- **User Profiles:** Each user has a profile and a unique shareable key for connecting.
- **Chat Requests:** Connect with others by sharing and entering 8-digit keys. Accept or reject requests.
- **Real-Time Chat:** Send, reply, edit, delete, and react to messages. Live updates and syncing.
- **Activity Tracking:** See online status and last seen for users.
- **Modern UI:** Responsive design with sidebar, chat area, and profile modal. Styled with TailwindCSS.
- **Secure Backend:** JWT authentication for all API routes. Data stored in MongoDB.

## Project Structure

- `src/app`: Next.js app directory (pages, layouts, API routes)
- `src/components`: Reusable React components (Chat, Sidebar, KeyModal, etc.)
- `src/hooks`: Custom React hooks (e.g., useOptimizedChat)
- `src/models`: Mongoose models for User, Chat, Message, ChatRequest
- `src/utils`: Utility functions for activity tracking, syncing, etc.
- `src/lib`: MongoDB connection logic
- `public`: Static assets

## Getting Started

1. **Install dependencies:**
	```bash
	npm install
	# or
	yarn install
	```

2. **Set up environment variables:**
	- Create a `.env.local` file in the root directory.
	- Add your MongoDB connection string and JWT secret:
	  ```env
	  MONGODB_URL=your_mongodb_connection_string
	  JWT_SECRET=your_jwt_secret
	  ```

3. **Run the development server:**
	```bash
	npm run dev
	# or
	yarn dev
	```

4. **Open the app:**
	Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up:** Create an account and save your PassKey for login.
2. **Login:** Use your password or PassKey to log in.
3. **Profile & Key:** Generate/share your 8-digit key to connect with others.
4. **Chat Requests:** Enter a friend's key to send a chat request. Accept or reject incoming requests.
5. **Chat:** Start messaging, reply, edit, delete, and react to messages in real-time.

## Future Improvements

- Group chats
- File/image sharing
- Notifications
- Message search
- Admin panel
- Mobile app
- End-to-end encryption
- Themes/dark mode
- Profile avatars
- Read receipts

## License

This project is open-source and available under the MIT License.

---

Made with ❤️ using Next.js, React, MongoDB, and TailwindCSS.
