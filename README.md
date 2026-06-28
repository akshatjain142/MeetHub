# MeetHub

MeetHub is a full-stack video conferencing web application built using the MERN Stack, WebRTC, and Socket.IO. It enables users to create and join video meetings, communicate through real-time chat, and maintain meeting history with a clean and responsive interface.

---

## Live Demo

Frontend: https://meethubfrontend-65io.onrender.com

Backend: https://meethubbackend-5rbl.onrender.com

---

## Features

- User Authentication (Login & Register)
- Real-time Video Calling using WebRTC
- Real-time Chat using Socket.IO
- Mute and Unmute Microphone
- Camera On and Off
- Screen Sharing
- Multiple Participants Support
- Meeting History
- Join Meetings with Unique Meeting ID
- Responsive User Interface

---

## Tech Stack

### Frontend

- React.js
- React Router DOM
- Material UI
- Axios
- Socket.IO Client
- WebRTC
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

### Deployment

- Render
- MongoDB Atlas

---

## Project Structure

```text
MeetHub/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/akshatjain142/MeetHub.git

cd MeetHub
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

The backend runs on:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend runs on:

```
http://localhost:5173
```

---

## Environment Variables

### Backend

Create a `.env` file inside the backend folder.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

### Frontend

Create a `.env` file inside the frontend folder.

```env
VITE_SERVER_URL=http://localhost:8000
```

For production:

```env
VITE_SERVER_URL=https://meethubbackend-5rbl.onrender.com
```

---

## Screenshots

Add screenshots of the following pages:

- Landing Page
- Authentication Page
- Home Dashboard
- Video Meeting
- Chat Panel
- Meeting History

---

## Future Enhancements

- Meeting Recording
- Waiting Room
- File Sharing
- Meeting Scheduling
- Virtual Backgrounds
- Emoji Reactions
- Notifications
- Invite Participants via Email

---

## Author

Akshat Jain

GitHub: https://github.com/akshatjain142

LinkedIn: https://www.linkedin.com/in/your-linkedin-profile/

Email: akshat049660@gmail.com

---

## License

This project is licensed under the MIT License.
