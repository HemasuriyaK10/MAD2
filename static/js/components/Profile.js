const Profile = { 
    template: `
    <div>
        <h2>Profile</h2>
        <div>
            <ul class="list-group" v-for="n in names">
            <li class="list-group-item"><b>Name :</b> {{n.name}}</li>
            <li class="list-group-item"><b>E-mail id :</b> {{n.emailid}}</li>
            </ul>
        </div>
        <div>
            <p><h3>To add your personal details to the profile:</h3></p>
            <form mx-10>
            <div>
                <label>Username: </label>
                <input v-model="username" type="text">
            </div>
            <div><br>
                <label>Email id: </label>
                <input v-model="email" type="text">
            </div>
            <div><br><button type="button" class="btn btn-primary" v-on:click="addToProf(username, email)">Submit</button></div>
            </form>
        </div>
    </div>`,
    data : function(){
        return{
            names : [],
            username : "",
            email : "",
        }
    },
    mounted : function(){
        fetch(`/user/getprof/${this.$route.params.id}`).then(res => res.json()).then(data =>{
            this.names = data
        })
    },
    methods:{
        addToProf:function(username, email){
            fetch(`/user/editprof/${this.$route.params.id}, ${username}, ${email}`).then(r => r.json()).then(d => {
                console.log(d);
                fetch(`/user/getprof/${this.$route.params.id}`).then(res => res.json()).then(data =>{
                    this.names = data
                })
            })
        },
    }
}

export default Profile;