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
        alert("Username handler just ran")
    }

    insertValidationElements() {
        this.allFields.forEach(function(el) {
            el.insertAdjacentHTML("afterend", '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }

}