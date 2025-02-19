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

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");//using hivemq
let WORD = "";
let sentIgnore = false;

let msg = document.getElementById("msg");
let room = document.getElementById("room");
let btn = document.querySelector(".btn");

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

  client.subscribe(WORD, (err) => {
    if (!err) console.log(`Subscribed to ${WORD}`);
    alert(`Joined ${WORD}`);
  });
  msg.focus();

  room.value = "";
}

client.on("message", (topic, message) => {
  if (sentIgnore == true) {
    sentIgnore = false;
    return;
  }

  if (topic === WORD) {
    const receive = document.createElement("div");
    receive.textContent = message.toString();
    document.querySelector("#receive").appendChild(receive);
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
  sent.textContent = message;
  document.querySelector("#sent").appendChild(sent);

  msg.value = "";
  msg.focus();
}
