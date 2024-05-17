const ManageItems = {
    template: `
    <div>
        <h2>Item management</h2>
        <div class="row">
            <div class="card my-3 mx-3 col-4" style="width: 18rem;" v-for="i in items">
                <div class="card-body">
                <h5 class="card-title">{{i.item_name}}</h5>
                <p class="card-text"><p>Rate is <b>{{i.rate}}</b>.</p><p>Available - {{i.qnty}} {{i.unit}}</p></p>
                <a v-on:click="DeleteItem(i.Sno)" class="btn btn-primary">Delete</a>
                </div>
            </div>
            <p><h3>To add new item:</h3></p>
            <form mx-10>
            <div>
                <label>Item name: </label>
                <input v-model="name" type="text">
            </div>
            <div><br>
                <label>Unit: </label>
                <input v-model="unit" type="text">
            </div>
            <div><br>
                <label>Rate: </label>
                <input v-model="rate" type="number">
            </div>
            <div><br>
                <label>Quantity: </label>
                <input v-model="qnty" type="number">
            </div>
            <div><br>
                <label>Category id: </label>
                <input v-model="cat_id" type="text">
            </div>
            <div><br><button type="button" class="btn btn-primary" v-on:click="addItem">Submit</button></div>
            </form>
        </div>
    </div>
    `,
    data : function(){
        return{
            items : [],
            name : "",
            unit : "",
            rate: 0,
            qnty: 0,
            cat_id: "",
        }
    },
    methods:{
        addItem:function(){
            const data = { items : [],
                    name : this.name,
                    unit : this.unit,
                    rate: this.rate,
                    qnty: this.qnty,
                    cat_id: this.cat_id };
            fetch("/manager/addItem", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(data),
            })
            .then((response) => response.json())
            .then((data) => {
                console.log("Success:", data);
                this.$router.go(0)
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        },
        DeleteItem:function(Sno){
            fetch(`/manager/deleteitem/${Sno}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.items = data
                })
            })
        },
    },
    mounted : function(){
        fetch("/manager/getitems").then(res => res.json()).then(data =>{
            this.items = data
        })
    }
}

export default ManageItems;