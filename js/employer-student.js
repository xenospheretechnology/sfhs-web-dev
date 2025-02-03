// script.js
const messageList = document.getElementById('messageList');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

messageForm.addEventListener('submit', function(event) {
  event.preventDefault();

  const messageText = messageInput.value;

  if (messageText.trim()) {
    // Append the new message to the message list as an employer message.
    appendMessage(messageText, 'employer-message');
    messageInput.value = '';

    // Simulate a student response after a short delay.
    setTimeout(() => {
      appendMessage('Thank you for the update!', 'student-message');
    }, 1000);
  }
});

function appendMessage(text, className) {
  const messageElement = document.createElement('div');
  messageElement.textContent = text;
  messageElement.classList.add('message', className);
  messageList.appendChild(messageElement);
  messageList.scrollTop = messageList.scrollHeight;
}