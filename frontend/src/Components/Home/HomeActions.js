import * as API_CALLS from '../ComponentAPI';
import * as HomeTypes from './HomeActionTypes.js';

export const uploadImage = (image) => {
    return async function (dispatch){
        dispatch({
            type: HomeTypes.UPLOAD_IMAGE_INIT,
            payload: {
                loading: true
            }
        });
        try {
            const results = await API_CALLS.uploadImage(image);
            dispatch({
                type: HomeTypes.UPLOAD_IMAGE_SUCCESS,
                payload: {
                    loading: false,
                    imageID: results.imageID
                }
            });
        } catch {
            dispatch({
                type: HomeTypes.UPLOAD_IMAGE_FAILURE,
                payload: { loading: false }
            });
        }
    };
};

export const updateCarDetails = (carDetails) => {
    return function (dispatch){
        dispatch({
            type: HomeTypes.UPDATE_CAR_DETAILS,
            payload: {
                carDetails: carDetails
            }
        });
    };
};

export const toggleLoading = () => {
    return function (dispatch){
        dispatch({
            type: HomeTypes.TOGGLE_LOADING
        });
    };
};

export const updateImage = (image) => {
    return function (dispatch){
        dispatch({
            type: HomeTypes.UPDATE_IMAGE,
            payload: {
                image: image
            }
        });
    };
};

export const getCarDetails = (imageID) => {
    return async function (dispatch) {
        dispatch({
            type: HomeTypes.GET_CAR_DETAILS_INIT,
            payload:{
                loading: true
            }
        });
        try {
            const carDetails = await API_CALLS.getMakeAndModel(imageID);
            dispatch({
                type: HomeTypes.UPDATE_CAR_DETAILS,
                payload: {
                    carDetails: carDetails
                }
            });
            dispatch({
                type: HomeTypes.GET_CAR_DETAILS_SUCCESS,
                payload: {
                    loading: false
                }
            });
        } catch {
            dispatch({
                type: HomeTypes.GET_CAR_DETAILS_FAILURE,
                payload: {
                    loading: false
                }
            });
        }
    }
};