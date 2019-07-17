import * as tf from '@tensorflow/tfjs';

require('@tensorflow/tfjs-node');

let data; //date loaded here from json file
let model;
let xs, ys; ; //xs => input, ys => outputs
let rSlider, gSlider, bSlider;
let labelP;
let lossP;
var lossCal;
var ctx;

let ind = 20;
var i = 0;

var red, green, blue, alpha;

//labels for colors
let labelList = [
  'red-ish',
  'green-ish',
  'blue-ish',
  'orange-ish',
  'yellow-ish',
  'pink-ish',
  'purple-ish',
  'brown-ish',
  'grey-ish'
]

function preload() {
    data = loadJSON('colorData.json');    //load json data into data variable.
   
}

async function loadMd() {
  console.log("Load");
  if (localStorage.length > 0) {
    const LEARNING_RATE = 0.25;
    const optimizer = tf.train.sgd(LEARNING_RATE);
    let item = Number(localStorage.getItem('saveNo'));
    model = await tf.loadModel('downloads://my-model-1');
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  } else {
    alert('No previous models saved!');
  }
}


function setup() {
load();
  console.log("data entries: " + data.entries.length);
  // Crude interface
  labelP = createP('label');
  lossP = createP('loss');
 
  let colors = [];
  let labels = [];
  for (let record of data.entries) {
    let col = [record.r / 255, record.g / 255, record.b / 255];   // normalise by dividing by 255
    colors.push(col);
    labels.push(labelList.indexOf(record.label));
  }

  xs = tf.tensor2d(colors);
  let labelsTensor = tf.tensor1d(labels, 'int32');      //9 color labels tensor[0,0,0,0,1,0,0,0,0,0 ]

  ys = tf.oneHot(labelsTensor, 9).cast('float32');      //create lables tensor
  labelsTensor.dispose();                               //clear memory leak

  model = tf.sequential();                              //create sequential neural model
  const hidden = tf.layers.dense({                      //create tensor dense layer
    units: 16,                                
    inputShape: [3],
     activation: 'sigmoid'                              //activation function. takes sum of all things passing through network and multiplied by weights and squashing it
  });
  const output = tf.layers.dense({                      //create dense layer
    units: 9,                                           //https://en.wikipedia.org/wiki/Softmax_function 
    activation: 'softmax'                     
  });
  model.add(hidden);
  model.add(output);

  const LEARNING_RATE = 0.25;
  const optimizer = tf.train.sgd(LEARNING_RATE);

  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',                    //meanSquaredError
    metrics: ['accuracy'],
  });

  train();
}

async function train() {
  await model.fit(xs, ys, {
    shuffle: true,
    validationSplit: 0.1,
    epochs: ind,                                    //number of times to iterate over the training data
    callbacks: {                                    //callbacks called during training
      onEpochEnd: (epoch, logs) => {
        lossCal = logs.loss;
        console.log(epoch+ ' Loss: ' + logs.loss );
        lossP.html('loss: ' + logs.loss.toFixed(5));
      },
      onBatchEnd: async (batch, logs) => {
        await tf.nextFrame();
      },
      onTrainEnd: () => {
        ind = 20;
        saver(model);
        console.log(model);
      console.log('finished');

      if(lossCal > .05)
      {
        train();
      }
      },
      shuffle:true
    },
  });//////////////////////THIS FUNCTION RETURNS A PROMISE////////////
}

async function saver(model)
{
  try {
    saveResult = await model.save('downloads://my-model-1' );
    console.log(model);
  }catch(anL){
    console.log(anL);
  }
}


let colorRGB = [[255,0,0],
[0,255,0],
[0,0,255],
[255,165,0],
[255,255,0],
[255,192,203],
[128,0,128],
[165,42,42],
[128,128,128]];

function check(arr)
{
  for(record in colorRGB)
  {
    console.log(colorRGB[record][0]);
  }
  i++;
}
function init()
{
  var c = document.getElementById("myCanvas");
  ctx = c.getContext("2d");
}

function getImgData()
{
    var imgData = ctx.getImageData(20,20,150,100);
    red = imgData.data[0];
    green = imgData.data[1];
    blue = imgData.data[2];
    alpha = imgData.data[3];
}
    function coordinates(canvasIn, coord)
    {
      var imgData  = canvasIn.getImageData(coord.x,coord.y,canvasIn.width, canvasIn,height);
      var can = canvasIn;
      if(can !== undefined)
      {

        red = imgData.data[0];
        green = imgData.data[1];
        blue = imgData.data[2];
        alpha = imgData.data[3];
        return;
      }
      imgData = ctx.getImageData(20,20,150,100);
      red = imgData.data[0];
      green = imgData.data[1];
      blue = imgData.data[2];
      alpha = imgData.data[3];
    }

function draw() {

    let r = red;  //slide to be replaced with integer of one of 9 color for testing
    let g = green;  //slide to be replaced with integer of one of 9 color for testing
    let b = blue;
    background(r, g, b);
    strokeWeight(2);
    stroke(255);
    line(frameCount % width, 0, frameCount % width, height);
    tf.tidy(() => {                         //memory clean 
      const input = tf.tensor2d([
        [r, g, b]
      ]);
      let results = model.predict(input);
      let argMax = results.argMax(1);
      let index = argMax.dataSync()[0];
      let label = labelList[index];
      labelP.html(label);
    });
  
}

var recW = 25;
var recH = 25;

function aveColor()
{
    //create a box, can be coorinates or 
    var boxWidthStart, boxWidthEnd;
    var boxHeightStart, boxHeightEnd;

    //get a color incremement the color associated
    var imgd = context.getImageData(boxWidthStart,boxHeightStart,recW, recH);
    var pix = imgd.data;
    console.log("imgd " + imdg);

    for(var i = 0,  n = pix.length; i < n ; i++)
    {
      console.log("Pixels: " + pix);

      pix[i  ] = 255 - pix[i  ]; // red
      pix[i+1] = 255 - pix[i+1]; // green
      pix[i+2] = 255 - pix[i+2]; // blue
      MediaKeySystemAccess.out.pr
      // i+3 is alpha (the fourth element)
    }

    tf.tidy(() => {                         //memory clean 
      const input = tf.tensor2d([
        [r, g, b]
      ]);
      let results = model.predict(input);
      let argMax = results.argMax(1);
      let index = argMax.dataSync()[0];
      let label = labelList[index];
      labelP.html(label);
    });
    
    // sort the frequencies of the color predictions

    //sort and sendback most frequent
}

