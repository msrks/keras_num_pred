# -*- coding: utf-8 -*-
from __future__ import print_function
from keras.models import model_from_yaml

model = model_from_yaml(open('models/net.yaml').read())
model.load_weights("models/weight.h5")
model.compile(loss='categorical_crossentropy', optimizer='adam')

import numpy as np

X = np.zeros((1,784))
X = X.reshape([-1, 28, 28, 1])
pred_prob = model.predict(X)[0].tolist()
print(pred_prob)
pred = model.predict_classes(X)
print(pred)
