const Cart = { 
    template: `
    <div>
        <h2>Hi {{items[0].username}}! Your Cart</h2>
        <div class = "row">
        <div class="card mx-3 my-3" style="width: 18rem;" v-for="i in items">
        <div class="card-body">
            <h5 class="card-title">Item name : <b>{{i.item}}</b></h5>
        </div>
        </div>
        <form mx-10>
            <div>
                <label>Search category: </label>
                <input v-model="Cat" type="text">
                <div><br><button type="button" class="btn btn-primary" v-on:click="searchCat(Cat)">Submit</button></div>
            </div>
        </form>

        <ul class="list-group" v-for="i in c">
        <li class="list-group-item">{{i.num}} - {{i.cat}} - {{i.id}}</li>
        </ul>

        <form mx-10>
            <div>
                <label>Search items: </label>
                <input v-model="search" type="text">
                <div><br><button type="button" class="btn btn-primary" v-on:click="searchItem(search)">Submit</button></div>
            </div>
        </form>

        <ul class="list-group" v-for="i in s">
        <li class="list-group-item">{{i.Sno}} - {{i.item_name}} - {{i.qnty}} {{i.unit}} - Rs {{i.rate}} per unit - {{i.cat_id}} category</li>
        </ul>

        <div>
        <p><h3>Items available:</h3></p>
        <ul class="list-group" v-for="n in names">
        <li class="list-group-item">{{n.Sno}} - {{n.item_name}} - {{n.qnty}} {{n.unit}} - Rs {{n.rate}} per unit - {{n.cat_id}} category</li>
        </ul>
        </div>

        <div>
        <p><h3>Categories available:</h3></p>
        <ul class="list-group" v-for="c in categories">
        <li class="list-group-item">{{c.num}} - {{c.cat}} - {{c.id}}</li>
        </ul>
        </div>
        
        </div>
    </div>`,
    data : function(){
        return{
            items: [],
            names: [],
            categories: [],
            s: [],
            c: [],
            search : "",
            Cat : "",
        }
    },
    mounted : function(){
        fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
            this.items = data
        });
        fetch("/manager/getitems").then(res => res.json()).then(data =>{
            this.names = data
        });
        fetch("/manager/categories").then(res => res.json()).then(data =>{
            this.categories = data
        });
    },
    methods:{
        searchItem:function(search){
            fetch(`/user/searchitem/${search}`).then(r => r.json()).then(d => {
                this.s = d;
                fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
                    this.items = data
                });
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.names = data
                });
                fetch("/manager/categories").then(res => res.json()).then(data =>{
                    this.categories = data
                });
            })
        },
        searchCat:function(Cat){
            fetch(`/user/searchcat/${Cat}`).then(r => r.json()).then(d => {
                this.c = d;
                fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
                    this.items = data
                });
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.names = data
                });
                fetch("/manager/categories").then(res => res.json()).then(data =>{
                    this.categories = data
                });
            })
        },
    }  
}

export default Cart;