// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// Bring in Phoenix channels client library:
import {Socket} from "phoenix"

// And connect to the path in "lib/exchat_web/endpoint.ex". We pass the
// token for authentication.
//
// Read the [`Using Token Authentication`](https://hexdocs.pm/phoenix/channels.html#using-token-authentication)
// section to see how the token should be used.
let socket = new Socket("/socket", {authToken: window.userToken})
socket.connect()

// Now that you are connected, you can join channels with a topic.
// Let's assume you have a channel with a topic named `room` and the
// subtopic is its id - in this case 42:

/* Initial Setup of variables and Joining Channel */
const ul = document.getElementById('msg-list');
const name = document.getElementById('name');
const msg = document.getElementById('msg');
const send = document.getElementById('send');
const peopleListMobile = document.getElementById('people_online-list-mobile');
const peopleListDesktop = document.getElementById('people_online-list-desktop');

const channel = socket.channel('room:42', {}); //connect to chat "room"
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })


// This function will show previous messages when the user first joins or refreshes the page.
channel.on('load_messages', payload => {
  // Load previous messages
  for (var i = 0; i < payload.messages.length; i++) {
    render_message(payload.messages[i]);
  }
  
  // Show currently online people
  const currentlyOnlinePeople = Object.entries(payload).map(elem => ({username: elem[0], id: elem[1].metas[0].phx_ref}))  
  updateOnlinePeopleList(currentlyOnlinePeople)
});

// This function will be probably caught when the person first enters the page
channel.on('presence_state', function (payload) {
  // Array of objects with id and username
  const currentlyOnlinePeople = Object.entries(payload).map(elem => ({username: elem[0], id: elem[1].metas[0].phx_ref}))
    
  updateOnlinePeopleList(currentlyOnlinePeople)
})

// Listening to presence events whenever a person leaves or joins
channel.on('presence_diff', function (payload) {
  if(payload.joins && payload.leaves) {
    // Array of objects with id and username
    const currentlyOnlinePeople = Object.entries(payload.joins).map(elem => ({username: elem[0], id: elem[1].metas[0].phx_ref}))
    const peopleThatLeft = Object.entries(payload.leaves).map(elem => ({username: elem[0], id: elem[1].metas[0].phx_ref}))

    updateOnlinePeopleList(currentlyOnlinePeople)
    removePeopleThatLeft(peopleThatLeft)
  }
});

function updateOnlinePeopleList(currentlyOnlinePeople) {
    // Add joined people
    for (var i = currentlyOnlinePeople.length - 1; i >= 0; i--) {
      const name = currentlyOnlinePeople[i].username
      const id = name + "-" + currentlyOnlinePeople[i].id
  
      if (document.getElementById(name) == null) {
        var liMobile = document.createElement("li"); // create new person list item DOM element for mobile
        var liDesktop = document.createElement("li"); // create new person list item DOM element for desktop
        
        liMobile.id = id + '_mobile'
        liDesktop.id = id + '_desktop'
        liMobile.innerHTML = `<caption>${sanitizeString(name)}</caption>`
        liDesktop.innerHTML = `<caption>${sanitizeString(name)}</caption>`

        peopleListMobile.appendChild(liMobile);                    // append to people list
        peopleListDesktop.appendChild(liDesktop);                    // append to people list
      }
    }
}

function removePeopleThatLeft(peopleThatLeft) {
  // Remove people that left
  for (var i = peopleThatLeft.length - 1; i >= 0; i--) {
    const name = peopleThatLeft[i].name
    const id = name + "-" + peopleThatLeft[i].id

    const personThatLeftMobile = document.getElementById(id + '_mobile')
    const personThatLeftDesktop = document.getElementById(id +  '_desktop')

    if (personThatLeftMobile != null && personThatLeftDesktop != null) {
      peopleListMobile.removeChild(personThatLeftMobile);         // remove the person from list mobile
      peopleListDesktop.removeChild(personThatLeftDesktop);        // remove the person from list desktop
    }
  }
}

channel.on('shout', payload => {
  render_message(payload);
});

function scroll_latest_message_into_view() {
  window.scrollTo(0, document.documentElement.scrollHeight) // desktop
  ul.scrollTo(0, ul.scrollHeight)                           // mobile
}

function sendMessage() {

  channel.push('shout', {
    name: name.value || "guest",
    message: msg.value,
    inserted_at: new Date()
  });

  msg.value = '';
}

function render_message(payload) {

  const li = document.createElement("li"); // create new list item DOM element

  // Message HTML with Tailwind CSS Classes for layout/style:
  li.innerHTML = `
  <div class="flex flex-row w-[95%] mx-2 border-b-[1px] border-slate-300 py-2">
    <div class="text-left w-1/5 font-semibold text-slate-800 break-words">
      ${sanitizeString(payload.name)}
      <div class="text-xs mr-1">
        <span class="font-thin">${formatDate(payload.inserted_at)}</span> 
        <span>${formatTime(payload.inserted_at)}</span>
      </div>
    </div>
    <div class="flex w-3/5 mx-1 grow">
      ${sanitizeString(payload.message)}
    </div>
  </div>
  `
  // Append to list
  ul.appendChild(li);

  scroll_latest_message_into_view();
}

msg.addEventListener('keypress', event => {
  if (event.keyCode == 13 && msg.value.length > 0){
    sendMessage();
  }
});

send.addEventListener('click', event => {
  if (msg.value.length > 0){
    sendMessage();
  }
})

/* UTILS ------------ */

// Date formatting
function formatDate(datetime) {
  const m = new Date(datetime);
  return m.getUTCFullYear() + "/" 
    + ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" 
    + ("0" + m.getUTCDate()).slice(-2);
}

// Time formatting
function formatTime(datetime) {
  const m = new Date(datetime);
  return ("0" + m.getUTCHours()).slice(-2) + ":"
    + ("0" + m.getUTCMinutes()).slice(-2) + ":"
    + ("0" + m.getUTCSeconds()).slice(-2);
}

// Sanitize string input borrowed from:
// stackoverflow.com/questions/23187013/sanitize-javascript-string
function sanitizeString(str){
  str = str.replace(/[^a-z0-9áéíóúñü \.,!_-]/gim,"");
  return str.trim();
}
export default socket
