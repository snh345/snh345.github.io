const messageForm = document.getElementById("messageForm");

var socket = io.connect();

console.log(socket)

messageForm.addEventListener("submit", (e) => {
    // avoids submit the form and refresh the page
    e.preventDefault();
  
    const messageInput = document.getElementById("messageInput");
  
    // check if there is a message in the input
    if (messageInput.value !== "") {
      let newMessage = messageInput.value;
      console.log(newMessage);
      //sends message and our id to socket server
      socket.emit("new-message", { user: socket.id, message: newMessage });
      // appends message in chat container, with isSelf flag true
      addMessage({ message: newMessage }, true);
      //resets input
      messageInput.value = "";
    } else {
      // adds error styling to input
      messageInput.classList.add("error");
    }
  });