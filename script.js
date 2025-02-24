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
//NOTE: This is not a secure way of using a broker, people using the same topic name on the same broker(here hivemq) will be able to see each other's messages
//if you want to improve it, try making your own broker.

let WORD = "";
let sentIgnore = false; //this setIgnore is used to block/ignore the message sent by you from displaying on the received side since the message
                        //go to the same topic and this can lead to what you send being displayed on the receive side, that is the nature of Mqtt,
                        //that's how it works. this ignore is not the best solution to deal with this as spamming messages/continuous messages being
                        // sent can LEAK into the receive side since 'on.message' is async and constantly listens for incoming messages

let msg = document.getElementById("msg");
let room = document.getElementById("room");
let btn = document.querySelector(".btn");
let roomname = document.querySelector(".chatroom-name");
const chatContainer = document.querySelector(".sent-recv");

const receiveSound = new Audio("./notification-sound/discord-notification.mp3");
const sentSound = new Audio("./notification-sound/pew.mp3");

room.focus();

room.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    joinChat();
  }
});

function joinChat() {
  if (WORD) {
    client.unsubscribe(WORD);
    roomname.innerText = "";
  }
  WORD = room.value.trim();
  if (WORD === "") return;

  document.getElementById("loader").style.display = "block";

  client.subscribe(WORD, (err) => {
    document.getElementById("loader").style.display = "none";
    if (!err) {
      console.log(`Subscribed to ${WORD}`);
      roomname.innerText = WORD;
    }
  });

  msg.focus();

  room.value = "";
}

function isUserNearBottom() {
  return (
    chatContainer.scrollHeight -
      chatContainer.scrollTop -
      chatContainer.clientHeight <
    70
  );
}

client.on("message", (topic, message) => {
  if (sentIgnore == true) {
    sentIgnore = false;
    return;
  }

  if (topic === WORD) {
    const receive = document.createElement("div");
    receive.classList.add("StyleReceive");
    receive.textContent = message.toString();

    let shouldScroll = isUserNearBottom();

    document.querySelector(".sent-recv").appendChild(receive);
    receiveSound.play();
    if (shouldScroll) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
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
  sentSound.play();

  msg.value = "";
  msg.focus();
}
