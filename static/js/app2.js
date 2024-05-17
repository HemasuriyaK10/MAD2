import Profile from "./components/Profile.js";
import Cart from "./components/Cart.js";
import EditCart from "./components/EditCart.js";

const routes = [
    { path: '/user/profile/:id', component: Profile },
    { path: '/user/cart/:username', component: Cart },
    { path: '/user/editcart/:username', component: EditCart },
  ]

const router = new VueRouter({
    routes 
  })

const a = new Vue({
    el: "#app2",
    delimiters: [ '${','}'],
    router
})