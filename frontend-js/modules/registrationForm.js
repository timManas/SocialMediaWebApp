import axios from "axios"

export default class RegistrationForm {

    constructor() {

        // This line selects the "FORM" and inside of all the elements which have ".form-control"
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()

        // Fetch the Form Id's
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""

        this.events()
    }

    // Events
    events() {
        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)      // THIS IS CALLING THE USERNAMEHANDLER
        })
    }

    // Methods

    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            // handler()
            handler.call(this)          
        }

        el.previousValue = el.value
    }

    // WTF ? WHAT IS CALLING THIS ????? 
    // I FUCKING GET ITTTTTT ..... You see the line this.isDifferent(this.username, this.usernameHandler) 
    // Yea ? Well the handler.call(this) will invoke handler aka userHandler() and call this function
    // BOOOM. usernameHandler EQUALS(==) handler
    // Think of it as a reference and calling it as a method using call(this)
    usernameHandler() {      
        
        // This method will run after every keystroke which changes the fields value
        // After each keyset, we want to reset the timer 
        // Only after 3000 ms, you want to run this method
        this.username.errors = false            // We need this to instantiate if there are errors or not on fields
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 3000 ) 
    }

    usernameImmediately() {
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            this.showValidationError(this.username, "Username can only contain letters and numbers")
        }

        if (this.username.value.length > 30) {
            this.showValidationError(this.username, "Username cannot exceed 30 characters")
        }

        // The moment there are no errors in the username, then we hide the error message
        if(!this.username.errors) {
            this.hideValidationError(this.username)
        }
    }

    hideValidationError(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }

    showValidationError(el, message) {
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true
    }

    // This runs after the 3000 ms
    usernameAfterDelay() {
        if (this.username.value.length < 3) {
            this.showValidationError(this.username, "Username must be 3 characters long")
        }

        // We use Axios to send asynch checks if the username has been taken already
        // The server will process this request and will send a response with either true or false
        if (!this.username.errors) {
            axios.post("/doesUsernameExists", {username: this.username.value}).then((response) => {
                if (response.data) {
                    this.showValidationError(this.username, "Username Already Taken")
                    this.username.isUnique = false
                } else {
                    this.username.isUnique = true
                }
            }).catch(() => {
                // Technical difficulty
                console.log("Please try again later")
            })
        }

    }


    insertValidationElements() {
        this.allFields.forEach(function(el) {
            el.insertAdjacentHTML("afterend", '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }

}