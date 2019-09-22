import Search from './modules/search'       // Why not use requires() here ?
import Chat from "./modules/chat"

// Leverage Chat IF the chat wrapper exists - i.e If user is logged
if (document.querySelector("#chat-wrapper")) {
    new Chat()
}   

// We start Search only when the search icon is there 
if (document.querySelector(".header-search-icon")) {
    new Search()
}