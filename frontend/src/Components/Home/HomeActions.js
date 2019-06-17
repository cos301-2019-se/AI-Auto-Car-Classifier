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
                    imageID: results.imageID,
                    carDetails: results.carDetails
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