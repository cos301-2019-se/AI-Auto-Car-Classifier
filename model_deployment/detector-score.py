############################################################################################################################
#                               Boolean  car detection Score file
############################################################################################################################

import sys
sys.setrecursionlimit(3000)
import azureml.core.model as azure_model
import json
import numpy as np
from imageai.Detection import ObjectDetection
import base64
import io
from imageio import imread
import cv2 as cv
import os


def init():
    global detector
    weights_path = azure_model.Model.get_model_path('car-detector-model') #get object detection model
    #initialise model
    detector = ObjectDetection() 
    detector.setModelTypeAsRetinaNet()
    detector.setModelPath(weights_path)
    detector.loadModel()

def run(raw_data):
    try:
        # with open("car.jpeg", "rb") as image_file: #this and the next line are for testing
        #     base64Img = base64.b64encode(image_file.read())
        base64Img = json.loads(raw_data)['data'] #read data sent as base64 string
        numpy_image = imread(io.BytesIO(base64.b64decode(base64Img))) #convert base64 image to numpy n-dimensional array in RGB format
        bgr_img = cv.cvtColor(numpy_image, cv.COLOR_RGB2BGR)
        detections = detector.detectObjectsFromImage(input_image=bgr_img, input_type='array', output_image_path='numpy.jpg')
        os.remove('numpy.jpg')
        for eachObject in detections:
            if eachObject['name'] == 'car' or eachObject['name'] == 'truck':
                return {"confidence": float(eachObject['percentage_probability']), "coordinates": eachObject['box_points']}
        
        return {"confidence": float(0.0)}

    except Exception as e:
        result = str(e)
        return {"error": result}