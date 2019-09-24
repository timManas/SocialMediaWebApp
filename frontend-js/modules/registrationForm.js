import axios from "axios"

export default class RegistrationForm {

    constructor() {

        // This line selects the "FORM" and inside of all the elements which have ".form-control"
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValidationElements()

        // Fetch the Form Id's
        this.form = document.querySelector("#registration-form")
        this.username = document.querySelector("#username-register")
        this.username.previousValue = ""
        this.email = document.querySelector("#email-register")
        this.email.previousValue = ""
        this.password = document.querySelector("#password-register")
        this.password.previousValue = ""

         // Axios will turn these to true if its Uniq
        this.username.isUnique = false         
        this.email.isUnique = false 
        this.events()
    }

    // Events
    events() {

        this.form.addEventListener("submit", e => {
            e.preventDefault()
            this.formSubmitHandler()
        })

        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)      // THIS IS CALLING THE USERNAMEHANDLER
        })

        this.email.addEventListener("keyup", () => {
            this.isDifferent(this.email, this.emailHandler)      // THIS IS CALLING THE EMAILEHANDLER
        })

        this.password.addEventListener("keyup", () => {
            this.isDifferent(this.password, this.passwordHandler)      // THIS IS CALLING THE PASSWPRDHANDLER
        })

        // We have blue to take care of cases where the user immediately escapes to the next field super quick
        // Thereby bypassing the 3000 ms check
        this.username.addEventListener("blur", () => {
            this.isDifferent(this.username, this.usernameHandler)      // THIS IS CALLING THE USERNAMEHANDLER
        })

        this.email.addEventListener("blur", () => {
            this.isDifferent(this.email, this.emailHandler)      // THIS IS CALLING THE EMAILEHANDLER
        })

        this.password.addEventListener("blur", () => {
            this.isDifferent(this.password, this.passwordHandler)      // THIS IS CALLING THE PASSWPRDHANDLER
        })
    }

    // Methods

    // We want all our validation to run and return no errors
    formSubmitHandler() {
        this.usernameImmediately()
        this.usernameAfterDelay()
        this.emailAfterDelay()
        this.passwordImmediately()
        this.passwordAfterDelay()

        // If everything is PERFECT !!! 
        if (this.username.isUnique && !this.username.errors &&
            this.email.isUnique && !this.email.errors &&
            !this.password.errors) {
            this.form.submit()
        }

    }

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
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 800 ) 
    }

    emailHandler() {      
        
        // This method will run after every keystroke which changes the fields value
        // After each keyset, we want to reset the timer 
        // Only after 3000 ms, you want to run this method
        this.email.errors = false            // We need this to instantiate if there are errors or not on fields
        clearTimeout(this.email.timer)
        this.email.timer = setTimeout(() => this.emailAfterDelay(), 800 ) 
    }



    passwordHandler() {      
        
        // This method will run after every keystroke which changes the fields value
        // After each keyset, we want to reset the timer 
        // Only after 3000 ms, you want to run this method
        this.password.errors = false            // We need this to instantiate if there are errors or not on fields
        this.passwordImmediately()
        clearTimeout(this.password.timer)
        this.password.timer = setTimeout(() => this.passwordAfterDelay(), 800 ) 
    }

    emailAfterDelay() {
        if (!/^\S+@+\S+$/.test(this.email.value)) {
            this.showValidationError(this.email, "Must provide valid email")
        }

        // If no errors are present... contains @
        if (!this.email.errors) {
            axios.post("/doesEmailExists", {email: this.email.value}).then((response) => {
                
                // Email exists =()
                if(response.data) {
                    this.email.isUnique = false
                    this.showValidationError(this.email, "Email already taken")
                } else {
                    this.email.isUnique = true
                    this.hideValidationError(this.email)
                }
            }).catch(() => {
                console.log("Please try again later")
            })
        }
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

    passwordImmediately() {
        if (this.password.value.length > 50) {
            this.showValidationError(this.password, "Password cannot exceed 50 characters ")
        } 

        if (!this.password.errors) {
            this.hideValidationError(this.password)
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

    passwordAfterDelay() {
        if (this.password.value.length < 5 ) {
            this.showValidationError(this.password, "Passowrd must be atleast 5 Characters")
        }
    }


    insertValidationElements() {
        this.allFields.forEach(function(el) {
            el.insertAdjacentHTML("afterend", '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }

}