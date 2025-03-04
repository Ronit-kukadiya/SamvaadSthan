
# SamvaadSthan - MQTT Chat App

SamvaadSthan is a real-time chat application built using MQTT, JavaScript, HTML, and CSS. It allows users to join chat rooms, send and receive messages instantly, and manage their connection status with an interactive UI.

## Features
- **Real-Time Messaging**: Instant chat using MQTT.
- **Multiple Chat Rooms**: Join different rooms with unique IDs.
- **User Online Status**: See active users.
- **Message Notifications**: Sound and visual alerts.
- **Simple UI**: Clean and easy-to-use interface.
- **Username Storage**: Saves username for convenience.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: MQTT (via EMQX broker)

## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Ronit-kukadiya/SamvaadSthan.git
   cd SamvaadSthan
   ```

2. Install dependencies:
   ```sh
   npm install
   ```



## Usage
1. Enter a username when prompted.
2. Join a chat room by entering a room ID.
3. Start chatting with other users.
4. Click **Clear Chat** to remove messages or **Leave Room** to exit.

## Screenshots

### Login Screen
![Login Screen](screenshots/login.png)

### Chat Room
![Chat Room](screenshots/chat-room.png)

### Live Page
![SamvaadSthan](https://ronit-kukadiya.github.io/SamvaadSthan/)

## File Structure
```
📂 SamvaadSthan
├── 📂 notification-sound   # Sound effects
├── 📄 index.html           # Main HTML file
├── 📄 package-lock.json    # Dependencies lock file
├── 📄 package.json         # Dependencies
├── 📄 script.js            # JavaScript
├── 📄 style.css            # CSS 
```

## MQTT Configuration

```javascript
const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt", options);
```

## Future Improvements
- User authentication
- Encrypted messaging
- Mobile-friendly UI


## Contributors
- **3BThakuri** (MAIN CONTRIBUTOR) - [GitHub](https://github.com/3BThakuri)
- **Ronit Kukadiya** - [GitHub](https://github.com/Ronit-kukadiya)
