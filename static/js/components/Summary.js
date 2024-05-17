const Summary = { 
    template: `
    <div>
        <h2>Download the available items!</h2>
        <div><button type="button" class="btn btn-primary" v-on:click="pdfDownload">Generate pdf</button></div>
        <br><br>
        <h5>To download available category details:</h5>
        <div><button type="button" class="btn btn-primary" v-on:click="csvDownload">Categories</button></div>
    </div>`,
    methods:{
        pdfDownload: function(){
            window.location.href='http://127.0.0.1:5000/pdf';
        },
        csvDownload: function(){
            fetch("/celery-job").then(r => r.json()).then(d => {
                console.log("Celery job done! :", d)
                
                setTimeout(() => {
                    window.location.href="/static/data.csv"
                })
            }, 2000);
        },
    }
}

export default Summary;