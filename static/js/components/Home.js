const Home = {
    template: `
    <div>
        <h2>Hello Manager!</h2>
        <div class="row">
            <div class="card my-3 mx-3 col-4" style="width: 18rem;" v-for="c in categories">
                <div class="card-body">
                <h5 class="card-title">{{c.cat}}</h5>
                <p class="card-text">The category id to be used is <b>{{c.id}}</b></p>
                <a v-on:click="DeleteCat(c.num)" class="btn btn-primary">Delete</a>
                <a v-on:click="viewItems(c.id)" class="btn btn-primary">View Items</a>
                </div>
            </div>
            <div>
            <p><h3>Items under chosen category:</h3>(click <b>View Items</b> in the corresponding cards)</p>
                    <li v-for="i in items">
                        {{i.item_name}} - {{i.qnty}} {{i.unit}} - Rs.{{i.rate}} per unit
                    </li>
            </div>
            <p><h3>To create new category:</h3></p>
            <form>
            <div>
                <label>Category name: </label>
                <input v-model="title" type="text">
            </div>
            <div><br>
                <label>Category id: </label>
                <input v-model="id" type="text">
            </div>
            <div><br><button type="button" class="btn btn-primary" v-on:click="CreateCat">Submit</button></div>
            </form>
        </div>
    </div>
    `,
    data : function(){
        return{
            categories : [],
            items : [],
            title : "",
            id : "",
        }
    },
    methods:{
        CreateCat:function(){
            const data = { title: this.title,
                            id: this.id, };
            fetch("/manager/createCat", {
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
        DeleteCat:function(num){
            fetch(`/manager/deletecat/${num}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch("/manager/categories").then(res => res.json()).then(data =>{
                    this.categories = data
                })
            })
        },
        viewItems:function(id){
            fetch(`/manager/viewItems/${id}`).then(r => r.json()).then(data => {
                this.items = data
            })
        },
    },
    mounted : function(){
        fetch("/manager/categories").then(res => res.json()).then(data =>{
            this.categories = data
        })
    }
}

export default Home;