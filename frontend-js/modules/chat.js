export default class Chat {

    constructor() {
        this.openedYet = false                                      // Need to check if window opened so we can establish a DB connection
        this.chatWrapper = document.querySelector("#chat-wrapper")      // When you need to select a specifc Element # for id   . is for class
        this.openIcon = document.querySelector(".header-chat-icon")     // Icon for opening the chat
        
        this.injectHTML()
        this.closeIcon = document.querySelector(".chat-title-bar-close") // Icon for closing the chat inside the chat window
        this.events()
    }

    // Events
    events() {

        /**
          Remember the reason we use () => function is because the arrow function will not
          modify the this keyword 

          Hence use:
          => when you want to refer to the object
          function(a,b) when you want to refer to the element getting clicked on 

         */


        this.openIcon.addEventListener("click", () => this.showChat())
        this.closeIcon.addEventListener("click", () => this.hideChat())
    }

    // Methods

    showChat() {
        if(!this.openedYet) {
            this.openConnection()
        }

        this.openedYet = true
        this.chatWrapper.classList.add("chat--visible")
    }

    hideChat() {
        this.chatWrapper.classList.remove("chat--visible")
    }

    injectHTML() {
        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div> 
        <div id="chat" class="chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
            <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
        </form>
        `
    }

    openConnection() {
       this.socket = io()            // This function will OPEN a connection between browser and server 

    }


}