import axios from 'axios';

export default function handleImageUpload() {

    axios.post('http://localhost:3001/classify/submit', { image: this.state.imagePreviewUrl }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            this.setState({
                route: 'classify/car_detector',
                loading: false,
                imageID: response.data.message
            });
        })
        .catch((error) => {
            console.log(error);
            this.setState({
                showImage: false,
                response: error,
                loading: false,
                probabilityBack: false
            });
        });
};