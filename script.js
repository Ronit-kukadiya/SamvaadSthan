// MQTT Chat Client - Improved version
// Configuration options
const options = {
  clean: true,
  connectTimeout: 4000,
  // Generate a unique client ID to prevent connection conflicts
  clientId: 'mqttchat_' + Math.random().toString(16).substr(2, 8),
  // Authentication - Comment out if using a public broker
  // username: "your_username",

};

// Connection status element
const statusIndicator = document.getElementById('connection-status');
// User information
let username = localStorage.getItem('mqtt_username') || '';
let currentRoom = '';
// Message elements
const msgInput = document.getElementById("msg");
const roomInput = document.getElementById("room");
const chatContainer = document.querySelector(".sent-recv");
const roomDisplay = document.querySelector(".chatroom-name");
const userList = document.getElementById("user-list");
const loader = document.getElementById("loader");

// Sound effects
const receiveSound = new Audio("./notification-sound/discord-notification.mp3");
const sentSound = new Audio("./notification-sound/pew.mp3");

// Connect to the MQTT broker with TLS
const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt", options);



// Initialize the application
function init() {
  // Show the username modal if not set
  if (!username) {
    document.getElementById('username-modal').style.display = 'flex';
    document.getElementById('username-input').focus();
  } else {
    roomInput.focus();
  }

  // Setup event listeners
  setupEventListeners();
  
  // Setup MQTT client event handlers
  setupMQTTHandlers();
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  // Enter key triggers join in room input
  roomInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") joinChat();
  });

  // Enter key triggers send in message input
  msgInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });
  
  // Username submission
  document.getElementById('username-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('username-input');
    username = usernameInput.value.trim();
    if (username) {
      localStorage.setItem('mqtt_username', username);
      document.getElementById('username-modal').style.display = 'none';
      roomInput.focus();
    }
  });
  
  // Clear chat button
  document.getElementById('clear-chat').addEventListener('click', () => {
    clearChat();
  });
  
  // Leave room button
  document.getElementById('leave-room').addEventListener('click', () => {
    leaveRoom();
  });
}

// Setup MQTT client event handlers
function setupMQTTHandlers() {
  // On connect
  client.on('connect', () => {
    console.log('Connected to MQTT broker');
    statusIndicator.textContent = 'Connected';
    statusIndicator.className = 'status-connected';
    loader.style.display = 'none';
  });
  
  // On reconnect
  client.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
    statusIndicator.textContent = 'Reconnecting...';
    statusIndicator.className = 'status-connecting';
    loader.style.display = 'block';
  });
  
  // On disconnect
  client.on('offline', () => {
    console.log('Disconnected from MQTT broker');
    statusIndicator.textContent = 'Disconnected';
    statusIndicator.className = 'status-disconnected';
  });
  
  // On error
  client.on('error', (error) => {
    console.error('MQTT connection error:', error);
    showNotification('Connection error: ' + error.message, 'error');
  });
  
  // On message receive
  client.on('message', (topic, message) => {
    // Parse the received message
    try {
      const msgObj = JSON.parse(message.toString());
      // Skip messages from ourselves by checking clientId instead of using a flag
      if (msgObj.clientId === options.clientId) return;
      
      // Process different message types
      switch (msgObj.type) {
        case 'chat':
          displayMessage(msgObj, false);
          break;
        case 'join':
          addUser(msgObj.username);
          showNotification(`${msgObj.username} joined the room`, 'info');
          break;
        case 'leave':
          removeUser(msgObj.username);
          showNotification(`${msgObj.username} left the room`, 'info');
          break;
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });
}

// Join a chat room
function joinChat() {
  if (!username) {
    document.getElementById('username-modal').style.display = 'flex';
    return;
  }
  
  const newRoom = roomInput.value.trim();
  if (!newRoom) return;
  
  // Leave current room if we're in one
  if (currentRoom) {
    leaveRoom();
  }
  
  loader.style.display = 'block';
  
  // Create a properly structured topic
  const chatTopic = `mqtt-chat/${newRoom}`;
  client.subscribe(chatTopic, (err) => {
    loader.style.display = 'none';
    if (err) {
      showNotification(`Failed to join ${newRoom}: ${err.message}`, 'error');
      return;
    }
    
    currentRoom = newRoom;
    roomDisplay.innerText = `Room: ${currentRoom}`;
    document.getElementById('room-controls').style.display = 'flex';
    
    // Clear previous messages
    clearChat();
    
    // Announce that we've joined
    publishMessage({
      type: 'join',
      username: username,
      clientId: options.clientId,
      timestamp: new Date().toISOString()
    });
    
    // Show welcome message
    showNotification(`You joined the room: ${currentRoom}`, 'success');
    
    // Focus on message input
    msgInput.focus();
    roomInput.value = "";
  });
}

// Leave the current room
function leaveRoom() {
  if (!currentRoom) return;
  
  // Announce that we're leaving
  publishMessage({
    type: 'leave',
    username: username,
    clientId: options.clientId,
    timestamp: new Date().toISOString()
  });
  
  // Unsubscribe from the topic
  client.unsubscribe(`mqtt-chat/${currentRoom}`);
  
  // Clear the UI
  currentRoom = '';
  roomDisplay.innerText = '';
  document.getElementById('room-controls').style.display = 'none';
  userList.innerHTML = '';
  
  // Focus back on room input
  roomInput.focus();
}

// Send a chat message
function sendMessage() {
  if (!currentRoom) {
    showNotification('Join a room first to send messages', 'warning');
    roomInput.focus();
    return;
  }
  
  const messageText = msgInput.value.trim();
  if (!messageText) return;
  
  // Create message object
  const messageObj = {
    type: 'chat',
    username: username,
    clientId: options.clientId,
    text: messageText,
    timestamp: new Date().toISOString()
  };
  
  // Publish the message
  publishMessage(messageObj);
  
  // Display our own message
  displayMessage(messageObj, true);
  
  // Clear and focus the input
  msgInput.value = '';
  msgInput.focus();
}

// Publish a message to the current room
function publishMessage(messageObj) {
  if (!currentRoom) return;
  
  client.publish(
    `mqtt-chat/${currentRoom}`,
    JSON.stringify(messageObj)
  );
}

// Display a message in the chat
function displayMessage(msgObj, isSent) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(isSent ? "StyleSent" : "StyleReceive");
  
  // Create the message content
  const header = document.createElement("div");
  header.classList.add("message-header");
  
  const nameSpan = document.createElement("span");
  nameSpan.classList.add("message-username");
  nameSpan.textContent = isSent ? "" : msgObj.username;
  
  const timeSpan = document.createElement("span");
  timeSpan.classList.add("message-time");
  const msgTime = new Date(msgObj.timestamp);
  timeSpan.textContent = msgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  header.appendChild(nameSpan);
  header.appendChild(timeSpan);
  
  const textDiv = document.createElement("div");
  textDiv.classList.add("message-text");
  textDiv.textContent = msgObj.text;
  
  messageElement.appendChild(header);
  messageElement.appendChild(textDiv);
  
  // Add to chat container
  chatContainer.appendChild(messageElement);

  messageElement.scrollIntoView({ behavior: "smooth" });
  
  // Auto-scroll if near bottom
  if (isUserNearBottom()) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  // Play sound
  if (isSent) {
    sentSound.play();
  } else {
    receiveSound.play();
  }
}

// Clear the chat history
function clearChat() {
  while (chatContainer.firstChild) {
    chatContainer.removeChild(chatContainer.firstChild);
  }
}

// Check if user is near the bottom of the chat
function isUserNearBottom() {
  return (
    chatContainer.scrollHeight - 
    chatContainer.scrollTop - 
    chatContainer.clientHeight < 70
  );
}

// Add a user to the user list
function addUser(username) {
  // Check if user already exists in the list
  const existingUser = document.querySelector(`.user-item[data-username="${username}"]`);
  if (existingUser) return;
  
  const userItem = document.createElement('div');
  userItem.classList.add('user-item');
  userItem.setAttribute('data-username', username);
  
  const userIcon = document.createElement('span');
  userIcon.classList.add('user-icon');
  userIcon.textContent = '👤';
  
  const userName = document.createElement('span');
  userName.classList.add('user-name');
  userName.textContent = username;
  
  userItem.appendChild(userIcon);
  userItem.appendChild(userName);
  userList.appendChild(userItem);
}

// Remove a user from the user list
function removeUser(username) {
  const userItem = document.querySelector(`.user-item[data-username="${username}"]`);
  if (userItem) {
    userList.removeChild(userItem);
  }
}

// Show a notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.classList.add('notification', `notification-${type}`);
  notification.textContent = message;
  
  document.getElementById('notifications').appendChild(notification);
  
  // Remove after a delay
  setTimeout(() => {
    notification.classList.add('notification-fade');
    setTimeout(() => {
      if (notification.parentNode) {
        document.getElementById('notifications').removeChild(notification);
      }
    }, 500);
  }, 5000);
}

// Initialize the app when the page loads
window.addEventListener('load', init);
