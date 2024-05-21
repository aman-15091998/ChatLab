const username = prompt("Enter your username:");
const welcomeSpan = document.querySelector(".welcome-heading span");
welcomeSpan.textContent = username.trim() + "!";

const joinNewBtn = document.querySelector("#join-new-btn");
const newRoomInput = document.querySelector("#room-input");
const joinExistingBtn = document.querySelector("#join-existing-btn");
const headingsDiv = document.querySelector(".headings");
const containerOne = document.querySelector(".container-one");
const containerTwo = document.querySelector(".container-two");
const roomIdSpan = document.querySelector("#room-id-span");
const activeUsersList = document.querySelector("#user-list");
const chatListDiv = document.querySelector("#chat-list");
const sendMessageBtn = document.querySelector("#send-btn");
const messageInput = document.querySelector("#message-input");
const leaveBtn = document.querySelector("#leave-btn");
const existingRoomInput = document.querySelector("#existing-room-input");

const socket = io.connect("https://chatlab-nsap.onrender.com/");
let roomName;
let socketID;
socket.emit("getRooms");
socket.on("availableRooms", (allRooms) => {
  let options = "";
  allRooms.forEach((room) => {
    options += `<option value="${room.roomname}">${room.roomname}</option>`;
  });
  existingRoomInput.innerHTML = options;
});

socket.on("updateUsers", (obj) => {
  let activeUsers = obj.activeRoomUsers;
  let usersTyping = obj.usersTyping;
  if (socketID == null && obj.socketID != null) {
    socketID = obj.socketID;
  }

  if (!headingsDiv.classList.contains("hide")) {
    // Display the container two
    headingsDiv.classList.add("hide");
    containerOne.classList.add("hide");
    containerTwo.classList.remove("hide");
    //   Set room id
    roomIdSpan.textContent = roomName;
  }

  //   Add active users
  activeUsersList.innerHTML = "";
  activeUsers.forEach((user) => {
    const newUserElement = document.createElement("div");
    newUserElement.classList.add("active-user-element");
    newUserElement.innerHTML = `<div class="online-indicator">
  <img
    src="./online-pulse-dot.gif"
    width="100%"
    height="100%"
    alt="online"
  />
</div>              
<p class="active-user-name">${user.socketID == socketID ? "You" : user.name} (${
      user._id
    }) <span class="typing">${
      usersTyping &&
      usersTyping.includes(user.socketID) &&
      user.socketID != socketID
        ? "typing..."
        : ""
    }</span> </p>`;
    activeUsersList.appendChild(newUserElement);
  });
});

socket.on("welcome", (user) => {
  const welcomeDiv = document.createElement("div");
  welcomeDiv.classList.add("user-update");
  welcomeDiv.innerHTML = `<p class="update joined">You(${user._id}) have joined the room<p>`;
  chatListDiv.appendChild(welcomeDiv);
});

socket.on("loadMessages", (oldMessages) => {
  console.log("oldMessages " + oldMessages);
  chatListDiv.innerHTML = "";
  oldMessages.forEach((obj) => {
    const newMessageElement = document.createElement("div");
    newMessageElement.classList.add("message-element");
    newMessageElement.innerHTML = `<div class="user-dp">
    <img
      src="./male-default-dp.png"
      height="100%"
      width="100%"
      alt=""
    />
  </div>   
  <div class="message">
    <p class="user-name">${obj.userID?.name || "*User"}</p>
    <p class="message-time">${getTime(obj.createdAt)}</p>
    <p class="user-message">
      ${obj.text}
    </p>
  </div>`;
    chatListDiv.appendChild(newMessageElement);
  });
});

socket.on("newMessage", async (obj) => {
  const newMessageElement = document.createElement("div");
  newMessageElement.classList.add("message-element");
  newMessageElement.innerHTML = `<div class="user-dp">
    <img
      src="./male-default-dp.png"
      height="100%"
      width="100%"
      alt=""
    />
  </div>
  <div class="message">
    <p class="user-name">${obj.user.name}</p>
    <p class="message-time">${getTime(obj.message.createdAt)}</p>
    <p class="user-message">
      ${obj.message.text}
    </p>
  </div>`;
  chatListDiv.appendChild(newMessageElement);
});
socket.on("newUserJoined", (newUser) => {
  const welcomeDiv = document.createElement("div");
  welcomeDiv.classList.add("user-update");
  welcomeDiv.innerHTML = `<p class="update joined">${newUser.name}(${newUser._id}) has joined the room<p>`;
  chatListDiv.appendChild(welcomeDiv);
});
socket.on("userLeft", (newUser) => {
  const welcomeDiv = document.createElement("div");
  welcomeDiv.classList.add("user-update");
  welcomeDiv.innerHTML = `<p class="update left">${newUser.name}(${newUser._id}) has left the room<p>`;
  chatListDiv.appendChild(welcomeDiv);
});

// Event isteners
joinNewBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (newRoomInput.value.trim() != "") {
    socket.emit("joinRoom", {
      username: username,
      room: newRoomInput.value,
    });
    roomName = newRoomInput.value;
    newRoomInput.disabled = true;
    joinNewBtn.disabled = true;
    joinExistingBtn.disabled = true;
  }
});
joinExistingBtn.addEventListener("click", (e) => {
  console.log("click");
  e.preventDefault();

  socket.emit("joinRoom", {
    username: username,
    room: existingRoomInput.value,
  });
  roomName = existingRoomInput.value;
  newRoomInput.disabled = true;
  joinNewBtn.disabled = true;
  joinExistingBtn.disabled = true;
});
messageInput.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    if (messageInput.value.trim() != "");
    {
      const newMessageElement = document.createElement("div");
      newMessageElement.classList.add("message-element");
      newMessageElement.classList.add("right-align");
      newMessageElement.innerHTML = `<div class="user-dp">
    <img
      src="./male-default-dp.png"
      height="100%"
      width="100%"
      alt=""
    />
  </div>
  <div class="message">
    <p class="user-name">You</p>
    <p class="message-time">${getTime(Date.now())}</p>
    <p class="user-message">
      ${messageInput.value}
    </p>
  </div>`;
      chatListDiv.appendChild(newMessageElement);
      socket.emit("newMessage", {
        text: messageInput.value,
        roomName: roomName,
      });
    }
    messageInput.value = "";
    socket.emit("stopTyping", roomName);
  }
});
messageInput.addEventListener("keyup", (e) => {
  if (messageInput.value.trim() == "") {
    socket.emit("stopTyping", roomName);
  }
});
messageInput.addEventListener("input", (e) => {
  e.preventDefault();

  socket.emit("typing", roomName);
});
sendMessageBtn.addEventListener("click", (e) => {
  if (messageInput.value.trim() != "");
  {
    const newMessageElement = document.createElement("div");
    newMessageElement.classList.add("message-element");
    newMessageElement.classList.add("right-align");
    newMessageElement.innerHTML = `<div class="user-dp">
    <img
      src="./male-default-dp.png"
      height="100%"
      width="100%"
      alt=""
    />
  </div>
  <div class="message">
    <p class="user-name">You</p>
    <p class="message-time">${getTime(Date.now())}</p>
    <p class="user-message">
      ${messageInput.value}
    </p>
  </div>`;
    chatListDiv.appendChild(newMessageElement);
    socket.emit("newMessage", { text: messageInput.value, roomName: roomName });
  }
  messageInput.value = "";
  socket.emit("stopTyping", roomName);
});
leaveBtn.addEventListener("click", (e) => {
  socket.emit("exitRoom", roomName);
  // hide the container two, display container one
  headingsDiv.classList.remove("hide");
  containerOne.classList.remove("hide");
  containerTwo.classList.add("hide");

  newRoomInput.disabled = false;
  joinNewBtn.disabled = false;
  joinExistingBtn.disabled = false;
  socket.emit("getRooms");
});

//utility functions
function getTime(timestamp) {
  let hours = new Date(timestamp).getHours();
  let minutes = new Date(timestamp).getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes % 10 == minutes ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}
