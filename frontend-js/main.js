import Search from './modules/search'       // Why not use requires() here ?

// We start Search only when the search icon is there 
if (document.querySelector(".header-search-icon")) {
    new Search()
}