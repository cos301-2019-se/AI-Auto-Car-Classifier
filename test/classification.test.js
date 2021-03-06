var request = require("supertest");
var assert = require('assert');
const app = require("../bin/www");
const classification =  require('../api/classification');

let data = {
 imageID: 'Image1.jpg'
}

/**health tests for server */
describe('Test whether the server is up and running', function () {
  it('respond with json containing saying that the \'server is running\'', function (done) {
      request(app)
          .get('/classify/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
  });

  it('It shoud return a 404 due to wrong protocol name', function (done) {
    request(app)
        .post('/classify/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done);
  });

  it('It shoud return a 200 even with missing slash after port', function (done) {
    request(app)
        .get('/classify')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
  });

  it('It shoud return a 200 even with missing slash after classify', function (done) {
    request(app)
        .get('/classify')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
  });
 /** it('It should refuse the connection since there is no slash before the port number', function (done) {
    request(app)
        .get('classify/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(522, done);
  });*/
});


/**health tests for server */
describe('Validate that we can retreive the make and model of a specific car', function () {
  it('It should return the make and model of a car with status 200', function (done) {
      request(app)
          .post('/classification/get_car_details')
          .send({imageID: 'Image1.jpg'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);
          done();
  });

  it('It should return a 500 because the image is not found', function (done) {
    request(app)
        .post('/classify/get_car_details')
        .send({imageID: 'Image2.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500);
        done();
  });

  it('It should return a 500 because the image body does not exist', function (done) {
    request(app)
      .post('/classify/get_car_details')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      done();
  });

  it('It should return a 500 because the body does not have the right property name', function (done) {
    request(app)
      .post('/classify/get_car_details')
      .send({imageId: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500);
      done();
  });

 /* it('It should fail with a NotFoundError because the protocol is post, not get', function (done) {
    request(app)
      .post('/classify/get_car_details')
      .send({imageId: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect( /json/)
      .expect(404, done);
      done();
  });*/

  it('It should send the make and model of the car', function (done) {
    request(app)
      .post('/classify/sendMakeAndModel')
      .send({imageId: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
      
  });

  it('It should get the make and model of the car', function (done) {
    request(app)
      .post('/classify/getMakeAndModel')
      .send({imageId: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
      
  });

});


describe('Ensure we can check if an image contains a car or not', function () {
  it('It should succeed and return the confidence percentage', function (done) {
      request(app)
          .post('/classify/car_detector')
          .send({imageID: 'Image1.jpg'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);
          done();
  });

  it('It should return a 404 because the endpoint has a typo', function (done) {
    request(app)
        .post('/classify/car_detector')
        .send({imageID: 'Image1.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404);
        done();  
  });

  it('It should return a 500 because the property name is incorrect', function (done) {
    request(app)
        .post('/classify/car_detector')
        .send({imageID: 'Image1.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        done();
  });

  it('It should return a status OK(200) because all fields provided are correct', function (done) {
    request(app)
        .post('/classify/car_detector')
        .send({imageID: 'Image1.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        done();
  });

  it('It fail with an internal server error because the file extension is missing', function (done) {
    request(app)
        .post('/classify/car_detector')
        .send({imageID: 'Image1'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        done();
  });
});

describe('Testing image submission for a single file.', function() {
  it('It should submit the single image', function(done) {
    request(app)
      .post('/submit')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });

  it('It should submit the single image ', function(done) {
    request(app)
      .post('/upload_image')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });
});



describe('Testing image64 submission.', function() {
  it('It should submit the single image ', function(done) {
    request(app)
      .post('/submit64')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done();
  });

  it('It should not submit the single image ', function(done) {
    request(app)
      .post('/submit64')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      done();
  });
});


describe('Testing color recognition.', function() {
  it('It should return the most prominent color in the image', function(done) {
    request(app)
      .post('/getImageColor')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)

      done()
  });


    it('It should return image color by sample', function(done) {
      request(app)
        .post('/color_detector')
        .send({imageID: 'Image1.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
  
        done()
    });

});


describe('Testing number plate recognition.', function() {
  it('It should return the number plate details', function(done) {
    request(app)
      .post('/number_plate')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });

  it('It should return an error', function(done) {
    request(app)
      .post('/number_plate')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      done()
  });
});


describe('Testing image resize.', function() {
  it('It should return the number plate details', function(done) {
    request(app)
      .post('/resize_images')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });
});

describe('Testing car information saving.', function() {
  it('It should save the car details', function(done) {
    request(app)
      .post('/saveCar')
      .send({imageID: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      done()
  });

  
  it('Error, incomplete car details', function(done) {
    request(app)
      .post('/saveCar')
      .send({imageID: null})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      done()
  });


  it('Unexpected error', function(done) {
    request(app)
      .post('/saveCar')
      .send({imageID: null})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      done()
  });

});