const options = {
  // Clean session
  // clean: true,
  // Authentication
  clientId: "01",
  // clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: "asdf",
  password: "password",
};
// THE OPTIONS ARE NOT USED IN THIS PROJECT

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt"); //using hivemq
let WORD = "";
let sentIgnore = false;

let msg = document.getElementById("msg");
let room = document.getElementById("room");
let btn = document.querySelector(".btn");
// let copy = document.getElementById("copy");
// copy.classList.add("fa", "fa-copy");

room.focus();

room.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    joinChat();
  }
});

function joinChat() {
  if (WORD) client.unsubscribe(WORD);
  WORD = room.value.trim();
  if (WORD === "") return;

  document.getElementById("loader").style.display = "block";

  client.subscribe(WORD, (err) => {
    document.getElementById("loader").style.display = "none";
    if (!err) console.log(`Subscribed to ${WORD}`);
    // alert(`Joined ${WORD}`);
  });

  msg.focus();

  room.value = "";
  // room.placeholder = WORD;
}

// copy.addEventListener("click", () => {
//   let roomCode = room.placeholder; 
//   if (!roomCode.trim()) {
//     alert("No Room Joined Yet");
//     return;
//   }

//   navigator.clipboard
//     .writeText(roomCode)
//     .then(() => {
//       let icon = copy.querySelector("i"); 
//       icon.classList.replace("fa-copy", "fa-check-double");  
//       setTimeout(() => {
//         icon.classList.replace("fa-check-double", "fa-copy");
//       }, 900);
//     })
//     .catch((err) => {
//       console.error("Clipboard error:", err);
//       alert("Failed to Copy");
//     });
// });


client.on("message", (topic, message) => {
  if (sentIgnore == true) {
    sentIgnore = false;
    return;
  }

  if (topic === WORD) {
    const receive = document.createElement("div");
    receive.classList.add("StyleReceive");
    receive.textContent = message.toString();
    document.querySelector(".sent-recv").appendChild(receive);
  }
});

msg.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  if (WORD === "") {
    alert("join a room first to send message!");
    room.focus();
    return;
  }
  var message = msg.value;
  if (message === "") return;

  sentIgnore = true;
  client.publish(WORD, message);

  const sent = document.createElement("div");
  sent.classList.add("StyleSent");
  sent.textContent = message;
  document.querySelector(".sent-recv").appendChild(sent);
  sent.scrollIntoView({ behavior: "smooth" });

  msg.value = "";
  msg.focus();
}
