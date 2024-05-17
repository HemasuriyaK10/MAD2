import Home from "./components/Home.js";
import ManageItems from "./components/ManageItems.js";
import Update from "./components/Update.js";
import Summary from "./components/Summary.js";

const routes = [
    { path: '/manager/home', component: Home },
    { path: '/manager/items', component: ManageItems },
    { path: '/manager/update', component: Update },
    { path: '/manager/summary', component: Summary }
  ]

const router = new VueRouter({
    routes 
  })

const a = new Vue({
    el: "#app",
    delimiters: [ '${','}'],
    data: {
        message: 'Hello Vue!'
      },
    router
})