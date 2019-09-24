import Search from './modules/search'       // Why not use requires() here ?
import Chat from "./modules/chat"
import RegistrationForm from "./modules/registrationForm"

// Leverage RegistrationForm ONLY if its on the screen
if (document.querySelector("#registration-form")) {
    new RegistrationForm()
}

// Leverage Chat IF the chat wrapper exists - i.e If user is logged
if (document.querySelector("#chat-wrapper")) {
    new Chat()
}   

// We start Search only when the search icon is there 
if (document.querySelector(".header-search-icon")) {
    new Search()
}