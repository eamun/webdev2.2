from flask_wtf import FlaskForm
from wtforms import SubmitField,StringField
from wtforms.validators import InputRequired

class Registrationform(FlaskForm):
    username=StringField('Username:',validators=[InputRequired()])
    submit=SubmitField('Confirm')