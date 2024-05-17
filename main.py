import os
from flask import Flask, render_template, request, jsonify, make_response, session, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_bcrypt import Bcrypt
from worker import create_celery_app
from celery.result import AsyncResult
from celery.schedules import crontab
from flask_mail import Mail, Message
import time
import jwt
import datetime
import pdfkit
from functools import wraps
from sqlalchemy import func

current_dir=os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///"+ os.path.join(current_dir,"project.sqlite3")
app.config['SECRET_KEY'] = '55603d5a5c1220bf15dbd969f6262cad'
app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'trialmad20@gmail.com'
app.config['MAIL_PASSWORD'] = 'tlqvgwivlgvnxejb'

db = SQLAlchemy(app)
celery = create_celery_app(app)
mail = Mail(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return Profile.query.get(int(user_id))

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.args.get('token')
        if not token:
            return jsonify({'message' : 'Token is missing!'}),403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
        except: 
            return jsonify({'message' : 'Token is invalid'}),403
        return f(*args, **kwargs)
    return decorated

@app.route('/hello')
def hello():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return 'Paste your token after http://localhost:5000/manager?token=  '

@app.route('/login', methods=['POST'])
def login():
    if request.form['username'] and request.form['password'] == 'password':
        session['logged_in'] = True
        token = jwt.encode({'user' : request.form['username'], 'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'])
        return jsonify({'Paste the following token after http://localhost:5000/manager?token= in the url' : token.decode('UTF-8')})
    return make_response( 'Could not verify!', 401, {'WWW-Authenticate' : 'Basic realm="Login Required"'})


@app.route('/pdf', methods=['GET', 'POST'])    
def gen_pdf():
    d = Items.query.all()
    rendered = render_template('pdf_template.html', d=d)
    pdf = pdfkit.from_string(rendered, False)    
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=data.pdf'
    return response

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=10, minute=30, day_of_month='1'),
        MonthlyReport.s(),
    )

@celery.task()
def MonthlyReport():
    d = Items.query.all()
    rendered = render_template('pdf_template.html', d=d)
    pdf = pdfkit.from_string(rendered, False)
    msg = Message('Report', sender='trialmad20@gmail.com', recipients=['21f1004740@ds.study.iitm.ac.in'])
    msg.attach("report.pdf", "application/pdf", pdf)
    mail.send(msg)

class Categories(db.Model):
    __tablename__='Categories'
    num = db.Column('num', db.Integer, primary_key=True, autoincrement=True)
    cat = db.Column('cat', db.String, nullable = False)
    id = db.Column('id', db.String, nullable = False)

class Items(db.Model):
    __tablename__='Items'
    Sno = db.Column('Sno', db.Integer, primary_key=True, autoincrement=True)
    item_name = db.Column('item_name', db.String, nullable = False)
    unit = db.Column('unit', db.String, nullable=False)
    rate = db.Column('rate', db.Integer, nullable=False)
    qnty = db.Column('qnty', db.Integer)
    cat_id = db.Column('cat_id', db.String, nullable = False)

class Profile(db.Model, UserMixin):
    __tablename__='Profile'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.String, nullable = False)
    emailid = db.Column('emailid', db.String)
    password = db.Column('password', db.String, nullable = False)

class Cart(db.Model):
    __tablename__='Cart'
    no = db.Column('no', db.Integer, primary_key=True, autoincrement=True)
    username = db.Column('username', db.String, nullable = False)
    item = db.Column('item', db.String)
    qty = db.Column('qty', db.Integer)

@app.route('/manager', methods=["GET", "POST"])
@token_required
def Manager():
    return render_template("manager.html")

class RegisterForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField("Register")
    def validate_username(self, username):
        existing_user_username = Profile.query.filter_by(name=username.data).first()
        if existing_user_username:
            raise ValidationError("That username already exists. Please choose a different one.")

class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Password"})
    submit = SubmitField("Login")

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signin', methods=['GET', 'POST'])
def signin():
    form = LoginForm()
    if form.validate_on_submit():
        user = Profile.query.filter_by(name=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                id = user.id
                username = user.name
                return render_template('user.html', id=id, username=username)
    return render_template('signin.html', form=form)

@app.route('/user', methods=["GET", "POST"])
@login_required
def User():
    return render_template("user.html")

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return render_template('home.html')

@app.route('/signout', methods=['GET', 'POST'])
def signout():
    return redirect(url_for('signin'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = Profile(name=form.username.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        addToCart(form.username.data)
        return redirect(url_for('signin'))
    return render_template('register.html', form=form)

def addToCart(n):
    c = Cart(username = n)
    db.session.add(c)
    db.session.commit()

@app.route('/manager/categories', methods=["GET", "POST"])
def CategoriesCards():
    c = Categories.query.all()
    data = []
    for card in c:
        data.append({
            'num' : card.num,
            'cat': card.cat,
            'id': card.id
        })
    print(data)
    return data

@app.route('/manager/createCat', methods=["POST"])
def createCat():
    data = request.get_json()
    c = Categories(cat = data.get("title", None), id = data.get("id", None))
    db.session.add(c)
    db.session.commit()
    return jsonify("Added successfully")

@app.route("/manager/deletecat/<num>")
def deleteCat(num):
    c = Categories.query.get(num)
    db.session.delete(c)
    db.session.commit()
    return jsonify("Category deleted!")

@app.route('/manager/updatecat/<sno>, <title>, <cid>', methods=["GET", "POST"])
def UpdateCat(sno, title, cid):
    c = Categories.query.get(sno)
    c.cat = title
    c.id = cid
    db.session.commit()
    return jsonify("Updated successfully")

@app.route("/manager/viewItems/<param>", methods=["GET", "POST"])
def viewItems(param):
    d = Items.query.filter(Items.cat_id == param)
    data = []
    for item in d:
        data.append({
            'Sno' : item.Sno,
            'item_name': item.item_name,
            'unit': item.unit,
            'rate': item.rate,
            'qnty': item.qnty,
            'cat_id': item.cat_id,
        })
    print(data)
    return data

@app.route("/manager/getitems", methods=["GET", "POST"])
def getItems():
    d = Items.query.all()
    data = []
    for item in d:
        data.append({
            'Sno' : item.Sno,
            'item_name': item.item_name,
            'unit': item.unit,
            'rate': item.rate,
            'qnty': item.qnty,
            'cat_id': item.cat_id,
        })
    print(data)
    return data

@app.route('/manager/addItem', methods=["POST"])
def addItem():
    data = request.get_json()
    c = Items(item_name = data.get("name", None), unit = data.get("unit", None), rate = data.get("rate", None), qnty = data.get("qnty", None), cat_id = data.get("cat_id", None))
    db.session.add(c)
    db.session.commit()
    return jsonify("Added successfully")

@app.route("/manager/deleteitem/<sno>")
def deleteItem(sno):
    c = Items.query.get(sno)
    db.session.delete(c)
    db.session.commit()
    return jsonify("Category deleted!")

@app.route('/manager/updateitem/<num>, <name>, <ut>, <rte>, <qty>, <id>', methods=["GET", "POST"])
def UpdateItem(num, name, ut, rte, qty, id):
    c = Items.query.filter(Items.Sno == num).first()
    c.item_name = name
    c.unit = ut
    c.rate = rte
    c.qnty = qty
    c.cat_id = id
    db.session.commit()
    return jsonify("Updated successfully")

@app.route('/user/getprof/<id>', methods=["GET", "POST"])
def GetProf(id):
    c = Profile.query.filter(Profile.id == id)
    data = []
    for card in c:
        data.append({
            'id' : card.id,
            'name': card.name,
            'emailid': card.emailid
        })
    print(data)
    return data

@app.route("/user/editprof/<id>, <username>, <email>")
def addProf(id, username, email):
    c = Profile.query.get(id)
    c.username = username
    c.emailid = email
    db.session.commit()
    return render_template('user.html', id=id)

@app.route('/user/getcart/<name>', methods=["GET", "POST"])
def GetCart(name):
    c = Cart.query.filter(Cart.username == name)
    data = []
    for card in c:
        data.append({
            'no' : card.no,
            'username': card.username,
            'item': card.item,
            'qty': card.qty,
        })
    print(data)
    return data

@app.route("/user/deletecart/<num>")
def deleteCart(num):
    c = Cart.query.get(num)
    db.session.delete(c)
    db.session.commit()
    return jsonify("Item in cart deleted!")

@app.route('/user/searchitem/<s>', methods=["GET", "POST"])
def searchItem(s):
    c = Items.query.filter(func.lower(Items.item_name) == func.lower(s))
    data = []
    for item in c:
        data.append({
            'Sno' : item.Sno,
            'item_name': item.item_name,
            'unit': item.unit,
            'rate': item.rate,
            'qnty': item.qnty,
            'cat_id': item.cat_id,
        })
    print(data)
    return data

@app.route('/user/searchcat/<s>', methods=["GET", "POST"])
def searchCat(s):
    c = Categories.query.filter(func.lower(Categories.cat) == func.lower(s))
    data = []
    for card in c:
        data.append({
            'num' : card.num,
            'cat': card.cat,
            'id': card.id
        })
    print(data)
    return data

@app.route('/user/addcart/<name>, <item>, <q>', methods=["GET", "POST"])
def AddCart(name, item, q):
    if (bool(Cart.query.filter(Cart.username == name, Cart.item == item).first())):
        a = Cart.query.filter(Cart.username == name, Cart.item == item).first()
        a.qty = a.qty + int(q)
        db.session.commit()
        print(a)
    else:
        c = Cart(username = name, item = item, qty = q)
        db.session.add(c)
        db.session.commit()
        print(c)
    editqnty(item, q)
    return jsonify("Added successfully")

def editqnty(n, q):
    i = Items.query.filter(func.lower(Items.item_name) == func.lower(n)).first()
    print(i)
    i.qnty = i.qnty - int(q)
    db.session.commit()
    return jsonify("Quantity modified")

@app.route('/user/mail/<id>', methods=["GET", "POST"])
def send_pdf(id):
    c = Profile.query.filter(Profile.id == id).first()
    username = c.name
    send.delay(username)
    return render_template('user.html', id=id, username=username)


@celery.task(name = 'celery_mail_pdf.send')
def send(uname):
    d = Cart.query.filter(Cart.username == uname)
    rendered = render_template('pdf_cart.html', d=d)
    pdf = pdfkit.from_string(rendered, False)
    user = Profile.query.filter(Profile.name == uname).first()
    msg = Message('Your Cart', sender='trialmad20@gmail.com', recipients=[user.emailid])
    msg.attach("output.pdf", "application/pdf", pdf)
    mail.send(msg)

@celery.task()
def summary():
    import csv, sqlite3
    time.sleep(5)
    fields = ['Sno', 'Category name', 'cat_id']
    rows = [ ['1', 'Electronics', 'elc'],
        ['2', 'Fruits', 'fr'],
        ['3', 'Groceries', 'gr'],
        ['4', 'Vegetables', 'veg'],
        ['5', 'Stationary', 'st'],
        ['6', 'Cosmetics', 'cos'],
        ['7', 'Clothing', 'clo'],]
    with open("static/data.csv", 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)

@app.route("/celery-job")
def celeryJob():
    a = summary.delay()
    return {
        "Task_id": a.id, 
        "Task_state": a.state,
        "Task_result": a.result
    }

@app.route("/status/<id>")
def check_stat(id):
    s = AsyncResult(id)
    res = {
        "Ready": s.ready(),
        "Result": s.result if s.ready() else None
    }
    return res

if __name__=='__main__':
    app.run(debug=True)