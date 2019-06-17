import axios from 'axios';

export const uploadImage = async (image) => {

    const response = await axios.post('http://localhost:3000/classify/submit', { image: image }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

export const getMakeAndModel = async (imageID) =>{
    const response = await axios.post('http://localhost:3000/classify/car_classifier', { imageID: imageID }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const carDetails = {
        make: response.data.make,
        model: response.data.model,
        bodyStyle: response.data.bodyStyle,
        year: response.data.year,
        confidence: response.data.confidence,
        color: '',
        numberPlate: ''
    };
    carDetails.color = await getCarColor(imageID);
    carDetails.numberPlate = await getNumberPlate(imageID);
    return carDetails;
};

export const getCarColor = async (imageID) => {
    const response = await axios.post('http://localhost:3000/classify/color_detector', { imageID: imageID }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data.color;
};

export const getNumberPlate = async (imageID) => {
    const response = await axios.post('http://localhost:3000/classify/number_plate', { imageID: imageID }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data.numberPlate;
};