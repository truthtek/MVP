// Establishing a connection to the Socket.io server
const socket = io();

// Selecting DOM elements for manipulation
const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Audio notification for new messages
const messageTone = new Audio('/message-tone.mp3');

// Event listener for the message form submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevents the default form submission behavior
  sendMessage(); // Calls the sendMessage function to handle the message
});

// Updating the total number of connected clients
socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Function to send a message
function sendMessage() {
  if (messageInput.value === '') return; // Prevent sending empty messages
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('message', data); // Emit the message data to the server
  addMessageToUI(true, data); // Add the message to the UI as the sender
  messageInput.value = ''; // Clear the message input field
}

// Listening for incoming chat messages from the server
socket.on('chat-message', (data) => {
  messageTone.play(); // Play notification sound for new messages
  addMessageToUI(false, data); // Add the message to the UI as a receiver
});

// Function to add messages to the UI
function addMessageToUI(isOwnMessage, data) {
  clearFeedback(); // Clear typing feedback messages
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;
  messageContainer.innerHTML += element; // Append the message to the message container
  scrollToBottom(); // Scroll to the bottom to show the latest message
}

// Function to scroll to the bottom of the message container
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Event listeners for typing feedback
messageInput.addEventListener('focus', () => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener('blur', () => {
  socket.emit('feedback', {
    feedback: '',
  });
});

// Listening for typing feedback from the server
socket.on('feedback', (data) => {
  clearFeedback(); // Clear existing feedback messages
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainer.innerHTML += element; // Append the feedback message to the message container
});

// Function to clear feedback messages
function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element); // Remove feedback messages from the DOM
  });
}
