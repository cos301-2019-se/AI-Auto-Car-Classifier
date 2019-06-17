const InitialState = {
    homeState: {
        file: '',
        imagePreviewUrl: '',
        showImage: false,
        loading: false,
        carProbability: null,
        route: 'classify/submit',
        imageID: null,
        probabilityBack: false,
        imageColor: '',
        colorBack: false
    },
    carResultState: {
        carInfo: null
    }
};

export default InitialState;