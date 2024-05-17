const EditCart = { 
    template: `
    <div>
        <h2>Update {{items[0].username}}'s cart!</h2>
        <div class = "row">
        <div class="card mx-3 my-3" style="width: 18rem;" v-for="i in items">
        <div class="card-body">
            <h5 class="card-title">Item name : <b>{{i.item}}</b>  {{i.qty}} units</h5>
            <a v-on:click="DeleteCart(i.no)" class="btn btn-primary">Delete</a>
        </div>
        </div>

        <div>
        <p><h3>Items available:</h3></p>
        <ul class="list-group" v-for="n in names">
        <li class="list-group-item">
            {{n.Sno}} - {{n.item_name}} - {{n.qnty}} {{n.unit}} - Rs {{n.rate}} per unit - {{n.cat_id}} category
            <label><b>Quantity: </b></label> <input v-model="qty" type="number">
            <a v-on:click="AddCart(n.item_name, qty)" class="btn btn-primary">Add</a>
        </li>
        </ul>
        </div>

        </div>
    </div>`,
    data : function(){
        return{
            items: [],
            names: [],
            qty: 0,
        }
    },
    mounted : function(){
        fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
            this.items = data
        });
        fetch("/manager/getitems").then(res => res.json()).then(data =>{
            this.names = data
        });
    },
    methods:{
        DeleteCart:function(no){
            fetch(`/user/deletecart/${no}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
                    this.items = data
                });
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.names = data
                });
            })
        },
       AddCart:function(item, qty){
        fetch(`/user/addcart/${this.$route.params.username}, ${item}, ${qty}`).then(res => res.json()).then(d =>{
            console(d);
            fetch(`/user/getcart/${this.$route.params.username}`).then(res => res.json()).then(data =>{
                this.items = data
            });
            fetch("/manager/getitems").then(res => res.json()).then(data =>{
                this.names = data
            });
        });
       }
    }  
}

export default EditCart;