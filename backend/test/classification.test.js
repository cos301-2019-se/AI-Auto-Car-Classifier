var request = require("supertest");
var should = require("should");
const app = require("../server.js");

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
  it('It should refuse the connection since there is no slash before the port number', function (done) {
    request(app)
        .get('classify/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(522, done);
  });
});


/**health tests for server */
describe('Validate that we can retreive the make and model of a specific car', function () {
  it('It should return the make and model of a car with status 200', function (done) {
      request(app)
          .post('/classify/get_car_details')
          .send({imageID: 'Image1.jpg'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
          done();
  });

  it('It return a 500 because the image is not found', function (done) {
    request(app)
        .post('/classify/get_car_details')
        .send({imageID: 'Image2.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500, done);
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
      .expect(500, done);
  });

  it('It should fail with a NotFoundError because the protocol is post, not get', function (done) {
    request(app)
      .post('/classify/get_car_details')
      .send({imageId: 'Image1.jpg'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});


describe('Ensure we can check if an image contains a car or not', function () {
  it('It should succeed and return the confidence percentage', function (done) {
      request(app)
          .post('/classify/car_detector')
          .send({imageID: 'Image1.jpg'})
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          done()
  });

  it('It should return a 404 because the endpoint has a typo', function (done) {
    request(app)
        .post('/classify/car_detector')
        .send({imageID: 'Image1.jpg'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        done()  
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
        done()
  });

});


