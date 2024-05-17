const Update = {
    template: `
    <div>
        <h2>Update data!</h2>
        <div>
        <p><h4>Categories:</h4></p>
        <ul class="list-group" v-for="c in categories">
        <li class="list-group-item">{{c.num}} - {{c.cat}} - {{c.id}}</li>
        </ul>
        </div>

        <div>
        <p><h4>To update categories:</h4></p>
        <form>
            <div>
                <label>Enter the serial no. of the category you would like to update: </label>
                <input v-model="sno" type="number">
            </div>
            <div>
                <label>New category name: </label>
                <input v-model="title" type="text">
            </div>
            <div><br>
                <label>New category id: </label>
                <input v-model="id" type="text">
            </div>
            <div><br><button type="button" class="btn btn-primary" v-on:click="UpdateCat(sno, title, id)">Submit</button></div>
        </form>
        </div>

        <div>
        <p><h4>Items:</h4></p>
        <ul class="list-group" v-for="n in items">
        <li class="list-group-item">{{n.Sno}} - {{n.item_name}} - {{n.qnty}} {{n.unit}} - Rs {{n.rate}} per unit - {{n.cat_id}} category</li>
        </ul>
        </div>

        <div>
        <p><h4>To update items:</h4></p>
        <form>
            <div>
                <label>Enter the serial no. of the item you would like to update: </label>
                <input v-model="num" type="number">
            </div>
            <div>
                <label>New item name: </label>
                <input v-model="name" type="text">
            </div>
            <div><br>
                <label>Its units: </label>
                <input v-model="unit" type="text">
            </div>
            <div><br>
                <label>New rate: </label>
                <input v-model="rate" type="number">
            </div>
            <div><br>
                <label>Available quantity: </label>
                <input v-model="qnty" type="number">
            </div>
            <div><br>
                <label>Category id: </label>
                <input v-model="cat_id" type="text">
            </div>
            <div><br><button type="button" class="btn btn-primary" v-on:click="UpdateItem(num, name, unit, rate, qnty, cat_id)">Submit</button></div>
        </form>
        </div>
        
    </div>
    `,
    data : function(){
        return{
            items : [],
            categories : [],
            sno: 0,
            num: 0,
            title : "",
            id : "",
            name : "",
            unit : "",
            rate: 0,
            qnty: 0,
            cat_id: "",
        }
    },
    methods:{
        UpdateCat: function(sno, title, id){
            fetch(`/manager/updatecat/${sno}, ${title}, ${id}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.items = data
                });
                fetch("/manager/categories").then(res => res.json()).then(data =>{
                    this.categories = data
                });
            })
        },
        UpdateItem: function(num, name, unit, rate, qnty, cat_id){
            fetch(`/manager/updateitem/${num}, ${name}, ${unit}, ${rate}, ${qnty}, ${cat_id}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch("/manager/getitems").then(res => res.json()).then(data =>{
                    this.items = data
                });
                fetch("/manager/categories").then(res => res.json()).then(data =>{
                    this.categories = data
                });
            })
        } 
    },
    mounted : function(){
        fetch("/manager/getitems").then(res => res.json()).then(data =>{
            this.items = data
        });
        fetch("/manager/categories").then(res => res.json()).then(data =>{
            this.categories = data
        });
    }
}

export default Update;