############################################################################################################################
#                                Car classsifier Score file
############################################################################################################################
# from keras.optimizers import SGD
# from keras.layers import Input, Dense, Conv2D, MaxPooling2D, AveragePooling2D, ZeroPadding2D, Flatten, Activation, add
# from keras.layers.normalization import BatchNormalization
# from keras.models import Model
# from keras.layers.core import Layer
# from keras.engine import InputSpec
# from keras import backend as K
# import codecs, json
# from sklearn.metrics import log_loss

# try:
#     from keras import initializations
# except ImportError:
#     from keras import initializers as initializations

# import sys
# sys.setrecursionlimit(3000)
# import azureml.core.model as azure_model

# #run function dependencies
# import numpy as np
# import cv2 as cv
# from azureml.core import Workspace, Datastore
# import scipy.io


# #scale_layers from custom_layers
# class Scale(Layer):
#     '''Learns a set of weights and biases used for scaling the input data.
#     the output consists simply in an element-wise multiplication of the input
#     and a sum of a set of constants:

#         out = in * gamma + beta,

#     where 'gamma' and 'beta' are the weights and biases larned.

#     # Arguments
#         axis: integer, axis along which to normalize in mode 0. For instance,
#             if your input tensor has shape (samples, channels, rows, cols),
#             set axis to 1 to normalize per feature map (channels axis).
#         momentum: momentum in the computation of the
#             exponential average of the mean and standard deviation
#             of the data, for feature-wise normalization.
#         weights: Initialization weights.
#             List of 2 Numpy arrays, with shapes:
#             `[(input_shape,), (input_shape,)]`
#         beta_init: name of initialization function for shift parameter
#             (see [initializations](../initializations.md)), or alternatively,
#             Theano/TensorFlow function to use for weights initialization.
#             This parameter is only relevant if you don't pass a `weights` argument.
#         gamma_init: name of initialization function for scale parameter (see
#             [initializations](../initializations.md)), or alternatively,
#             Theano/TensorFlow function to use for weights initialization.
#             This parameter is only relevant if you don't pass a `weights` argument.
#     '''
#     def __init__(self, weights=None, axis=-1, momentum = 0.9, beta_init='zero', gamma_init='one', **kwargs):
#         self.momentum = momentum
#         self.axis = axis
#         self.beta_init = initializations.get(beta_init)
#         self.gamma_init = initializations.get(gamma_init)
#         self.initial_weights = weights
#         super(Scale, self).__init__(**kwargs)

#     def build(self, input_shape):
#         self.input_spec = [InputSpec(shape=input_shape)]
#         shape = (int(input_shape[self.axis]),)

#         # Compatibility with TensorFlow >= 1.0.0
#         self.gamma = K.variable(self.gamma_init(shape), name='{}_gamma'.format(self.name))
#         self.beta = K.variable(self.beta_init(shape), name='{}_beta'.format(self.name))
#         #self.gamma = self.gamma_init(shape, name='{}_gamma'.format(self.name))
#         #self.beta = self.beta_init(shape, name='{}_beta'.format(self.name))
#         self.trainable_weights = [self.gamma, self.beta]

#         if self.initial_weights is not None:
#             self.set_weights(self.initial_weights)
#             del self.initial_weights

#     def call(self, x, mask=None):
#         input_shape = self.input_spec[0].shape
#         broadcast_shape = [1] * len(input_shape)
#         broadcast_shape[self.axis] = input_shape[self.axis]

#         out = K.reshape(self.gamma, broadcast_shape) * x + K.reshape(self.beta, broadcast_shape)
#         return out

#     def get_config(self):
#         config = {"momentum": self.momentum, "axis": self.axis}
#         base_config = super(Scale, self).get_config()
#         return dict(list(base_config.items()) + list(config.items()))
# #resnet_152 functions
# def identity_block(input_tensor, kernel_size, filters, stage, block):
#     '''The identity_block is the block that has no conv layer at shortcut
#     # Arguments
#         input_tensor: input tensor
#         kernel_size: defualt 3, the kernel size of middle conv layer at main path
#         filters: list of integers, the nb_filters of 3 conv layer at main path
#         stage: integer, current stage label, used for generating layer names
#         block: 'a','b'..., current block label, used for generating layer names
#     '''
#     eps = 1.1e-5
#     nb_filter1, nb_filter2, nb_filter3 = filters
#     conv_name_base = 'res' + str(stage) + block + '_branch'
#     bn_name_base = 'bn' + str(stage) + block + '_branch'
#     scale_name_base = 'scale' + str(stage) + block + '_branch'

#     x = Conv2D(nb_filter1, (1, 1), name=conv_name_base + '2a', use_bias=False)(input_tensor)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2a')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2a')(x)
#     x = Activation('relu', name=conv_name_base + '2a_relu')(x)

#     x = ZeroPadding2D((1, 1), name=conv_name_base + '2b_zeropadding')(x)
#     x = Conv2D(nb_filter2, (kernel_size, kernel_size),
#                       name=conv_name_base + '2b', use_bias=False)(x)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2b')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2b')(x)
#     x = Activation('relu', name=conv_name_base + '2b_relu')(x)

#     x = Conv2D(nb_filter3, (1, 1), name=conv_name_base + '2c', use_bias=False)(x)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2c')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2c')(x)

#     x = add([x, input_tensor], name='res' + str(stage) + block)
#     x = Activation('relu', name='res' + str(stage) + block + '_relu')(x)
#     return x

# def conv_block(input_tensor, kernel_size, filters, stage, block, strides=(2, 2)):
#     '''conv_block is the block that has a conv layer at shortcut
#     # Arguments
#         input_tensor: input tensor
#         kernel_size: defualt 3, the kernel size of middle conv layer at main path
#         filters: list of integers, the nb_filters of 3 conv layer at main path
#         stage: integer, current stage label, used for generating layer names
#         block: 'a','b'..., current block label, used for generating layer names
#     Note that from stage 3, the first conv layer at main path is with subsample=(2,2)
#     And the shortcut should have subsample=(2,2) as well
#     '''
#     eps = 1.1e-5
#     nb_filter1, nb_filter2, nb_filter3 = filters
#     conv_name_base = 'res' + str(stage) + block + '_branch'
#     bn_name_base = 'bn' + str(stage) + block + '_branch'
#     scale_name_base = 'scale' + str(stage) + block + '_branch'

#     x = Conv2D(nb_filter1, (1, 1), strides=strides,
#                       name=conv_name_base + '2a', use_bias=False)(input_tensor)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2a')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2a')(x)
#     x = Activation('relu', name=conv_name_base + '2a_relu')(x)

#     x = ZeroPadding2D((1, 1), name=conv_name_base + '2b_zeropadding')(x)
#     x = Conv2D(nb_filter2, (kernel_size, kernel_size),
#                       name=conv_name_base + '2b', use_bias=False)(x)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2b')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2b')(x)
#     x = Activation('relu', name=conv_name_base + '2b_relu')(x)

#     x = Conv2D(nb_filter3, (1, 1), name=conv_name_base + '2c', use_bias=False)(x)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '2c')(x)
#     x = Scale(axis=bn_axis, name=scale_name_base + '2c')(x)

#     shortcut = Conv2D(nb_filter3, (1, 1), strides=strides,
#                              name=conv_name_base + '1', use_bias=False)(input_tensor)
#     shortcut = BatchNormalization(epsilon=eps, axis=bn_axis, name=bn_name_base + '1')(shortcut)
#     shortcut = Scale(axis=bn_axis, name=scale_name_base + '1')(shortcut)

#     x = add([x, shortcut], name='res' + str(stage) + block)
#     x = Activation('relu', name='res' + str(stage) + block + '_relu')(x)
#     return x

# def resnet152_model(img_rows, img_cols, color_type=1, num_classes=None):
#     """
#     Resnet 152 Model for Keras

#     Model Schema and layer naming follow that of the original Caffe implementation
#     https://github.com/KaimingHe/deep-residual-networks

#     ImageNet Pretrained Weights 
#     Theano: https://drive.google.com/file/d/0Byy2AcGyEVxfZHhUT3lWVWxRN28/view?usp=sharing
#     TensorFlow: https://drive.google.com/file/d/0Byy2AcGyEVxfeXExMzNNOHpEODg/view?usp=sharing

#     Parameters:
#       img_rows, img_cols - resolution of inputs
#       channel - 1 for grayscale, 3 for color 
#       num_classes - number of class labels for our classification task
#     """
#     eps = 1.1e-5

#     # Handle Dimension Ordering for different backends
#     global bn_axis
#     if K.image_dim_ordering() == 'tf':
#       bn_axis = 3
#       img_input = Input(shape=(img_rows, img_cols, color_type), name='data')
#     else:
#       bn_axis = 1
#       img_input = Input(shape=(color_type, img_rows, img_cols), name='data')

#     x = ZeroPadding2D((3, 3), name='conv1_zeropadding')(img_input)
#     x = Conv2D(64, (7, 7), strides=(2, 2), name='conv1', use_bias=False)(x)
#     x = BatchNormalization(epsilon=eps, axis=bn_axis, name='bn_conv1')(x)
#     x = Scale(axis=bn_axis, name='scale_conv1')(x)
#     x = Activation('relu', name='conv1_relu')(x)
#     x = MaxPooling2D((3, 3), strides=(2, 2), name='pool1')(x)

#     x = conv_block(x, 3, [64, 64, 256], stage=2, block='a', strides=(1, 1))
#     x = identity_block(x, 3, [64, 64, 256], stage=2, block='b')
#     x = identity_block(x, 3, [64, 64, 256], stage=2, block='c')

#     x = conv_block(x, 3, [128, 128, 512], stage=3, block='a')
#     for i in range(1,8):
#       x = identity_block(x, 3, [128, 128, 512], stage=3, block='b'+str(i))

#     x = conv_block(x, 3, [256, 256, 1024], stage=4, block='a')
#     for i in range(1,36):
#       x = identity_block(x, 3, [256, 256, 1024], stage=4, block='b'+str(i))

#     x = conv_block(x, 3, [512, 512, 2048], stage=5, block='a')
#     x = identity_block(x, 3, [512, 512, 2048], stage=5, block='b')
#     x = identity_block(x, 3, [512, 512, 2048], stage=5, block='c')

#     x_fc = AveragePooling2D((7, 7), name='avg_pool')(x)
#     x_fc = Flatten()(x_fc)
#     x_fc = Dense(1000, activation='softmax', name='fc1000')(x_fc)

#     model = Model(img_input, x_fc)

#     weights_path = azure_model.Model.get_model_path('image_detection_model')

#     model.load_weights(weights_path, by_name=True)

#     # Truncate and replace softmax layer for transfer learning
#     # Cannot use model.layers.pop() since model is not of Sequential() type
#     # The method below works since pre-trained weights are stored in layers but not in the model
#     x_newfc = AveragePooling2D((7, 7), name='avg_pool')(x)
#     x_newfc = Flatten()(x_newfc)
#     x_newfc = Dense(num_classes, activation='softmax', name='fc8')(x_newfc)

#     model = Model(img_input, x_newfc)

#     # Learning rate is changed to 0.001
#     sgd = SGD(lr=1e-3, decay=1e-6, momentum=0.9, nesterov=True)
#     model.compile(optimizer=sgd, loss='categorical_crossentropy', metrics=['accuracy'])

#     return model

# def init():
#     global model, class_names
#     model = resnet152_model(224, 224, 3, 196)
#     ws = Workspace(subscription_id='d4ab7ef5-e767-4bec-9593-30d1ca4e1789', resource_group='AIAutoCarClassifier', workspace_name='controlaltelite')
#     ds = ws.get_default_datastore()
#     ds.download(target_path='.', prefix='cars_meta', show_progress=True)
#     cars_meta = scipy.io.loadmat('cars_meta')
#     class_names = cars_meta['class_names']
#     class_names = np.transpose(class_names)

# def run(raw_data):
#     try:
#         img_width, img_height = 224, 224
#         image = json.loads(raw_data)['data']
#         bgr_img = np.array(image, dtype='uint8')
#         bgr_img = cv.resize(bgr_img, (img_width, img_height), cv.INTER_CUBIC)
#         rgb_img = cv.cvtColor(bgr_img, cv.COLOR_BGR2RGB)
#         rgb_img = np.expand_dims(rgb_img, 0)
#         preds = model.predict(rgb_img)
#         prob = np.max(preds)
#         class_id = np.argmax(preds)
#         return {"car": class_names[class_id][0][0], "confidence": float(prob)}
#     except Exception as e:
#         result = str(e)
#         return {"error": result}




############################################################################################################################
#                                Boolean  car detection Score file
############################################################################################################################

# import sys
# sys.setrecursionlimit(3000)
# import azureml.core.model as azure_model

# from keras.models import load_model
# import numpy as np 
# import os,sys
# from PIL import Image
# import matplotlib.pyplot as plot
# import codecs, json

# def grayscale(picture):
#     res= Image.new(picture.mode, picture.size)
#     width, height = picture.size

#     for i in range(0, width):
#         for j in range(0, height):
#             pixel=picture.getpixel((i,j))
#             avg=(pixel[0]+pixel[1]+pixel[2])/3
#             res.putpixel((i,j),(int(avg),int(avg),int(avg)))
#     return res

# # Normalize between 0 and 1 
# def normalize(picture):
# 	width, height = picture.size
# 	normalized_array = []
# 	for j in range(0, height):
# 		for i in range(0, width):
# 			pixel = picture.getpixel((i,j))
# 			normalized_array.append( pixel[0] / 255.0 )
# 	return np.array(normalized_array)  

# def init():
#     global model
#     weights_path = azure_model.Model.get_model_path('boolean_car_classifier')
#     model = load_model(weights_path)
    

# def run(raw_data):
#     try:
#         row,column = 100,100
#         raw_img = json.loads(raw_data)['data']
#         numpy_arr = np.array(raw_img, dtype='uint8')
#         numpy_arr = numpy_arr - 18
#         img = Image.fromarray(numpy_arr)
#         img = img.resize((row,column),Image.ANTIALIAS)
#         gray_image = grayscale(img)
#         X_test = normalize(gray_image)
#         X_test = X_test.reshape(1, row, column, 1)  # (1, row, column) 3D input for CNN 
#         classes = model.predict(X_test)
#         return {"confidence": float(classes[0][0])}
#     except Exception as e:
#         result = str(e)
#         return {"error": result}


