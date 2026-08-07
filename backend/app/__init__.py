from flask import Flask
from flask_cors import CORS

from app.apis.health import blueprint_health
from app.apis.runs import blueprint_runs
from app.config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

app.register_blueprint(blueprint_health)
app.register_blueprint(blueprint_runs)
