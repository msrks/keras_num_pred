# -*- coding: utf-8 -*-
from __future__ import division, print_function
import flask
import numpy as np
from keras.models import model_from_yaml

model = model_from_yaml(open('models/net.yaml').read())
model.load_weights("models/weight.h5")
model.compile(loss='categorical_crossentropy', optimizer='adam')

### Flask App
app = flask.Flask(__name__)

@app.route("/")
def main():
    return flask.render_template("test.html")

@app.route("/score", methods=["POST"])
def score():
    data = flask.request.json

    current_image = np.zeros((1,784))
    for i in data["example"]:
        if i >= 0 and i < 784:
            current_image[0][i] = 1
    X = current_image.reshape([-1, 28, 28, 1])
    pred = model.predict(X)[0].tolist()
    #pred = np.random.random(10)/5
    #pred = pred.tolist()
    #pred = [0.001, 0.002, 0.005, 0.4, 0.1, 0.1, 0.1, 0.1, 0.2, 0.2]
    results = {"pred": pred}
    return flask.jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
