from flask import Flask, render_template,request,url_for,redirect,g,session
from forms import Registrationform
from database import get_db, close_db
from flask_session import Session
from functools import wraps

app=Flask(__name__)
#Session(app)
app.config["SECRET_KEY"] = "super-secret-key"
app.teardown_appcontext(close_db)

@app.before_request
def logged_in_user():
    g.user = session.get("username", None)

def regrequired(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return redirect(url_for("register", next=request.url))
        return view(*args, **kwargs)
    return wrapped_view

@app.route('/')
def index():
    db = get_db()
    players = db.execute("""SELECT * FROM players ORDER BY highscore DESC LIMIT 20;""").fetchall()
    return render_template('index.html',players=players)

@app.route('/zombies')
@regrequired
def zombies():
    return render_template('game.html')

@app.route("/register", methods=["GET", "POST"])
def register():
    form = Registrationform()
    if form.validate_on_submit():
        username = form.username.data
        db = get_db()
        clashinguser = db.execute(
            """SELECT * FROM players WHERE username = ?;""", (username,)
        ).fetchone()
        if clashinguser is not None:
            form.username.errors.append("Username already taken!")
        else:
            session.clear()
            session["username"] = username
            return redirect(url_for("zombies"))
    return render_template("reg.html", form=form)

@app.route('/store_score',methods=['POST'])
def store_score():
    username=session['username']
    score=int(request.form['score'])
    db=get_db()
    if score>0 and score<581:
        db.execute("""INSERT INTO players (username,highscore) VALUES (?,?);""",[username,score],)
        db.commit()
    return 'success'