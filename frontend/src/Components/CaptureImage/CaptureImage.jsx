import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { CircularProgress, Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import styles from './CaptureImageStyles';
import axios from 'axios';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import green_tick from '../../Assets/smallCongratulations.png';
import small_error from '../../Assets/smallError.png';

class CaptureImage extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
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
        };
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleImageUpload= this.handleImageUpload.bind(this);
        this.handleGoHome = this.handleGoHome.bind(this);
        this.carHandler = this.carHandler.bind(this);
        this.colorHandler = this.colorHandler.bind(this);
        this.plateHandler = this.plateHandler.bind(this);
    }
    
    colorHandler(e){
        //Check if image is a car
        //get color of car
        this.setState({
            colorBack: false,
            carProbability: null,
            imageColor: '',
            probabilityBack: false
        });
        if (this.state.imageID === null) {   
            console.log('Image Id not found');
            return;   
        } else {
            this.setState({
                loading: true,
                imageColor: null
            });
            axios.post('http://localhost:3001/classify/color_detector', { imageID: this.state.imageID }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) =>{
                    this.setState({
                        imageColor: response.data.color,
                        colorBack: true,
                        loading: false 
                    });
                    console.log('ImageCOlor: '+response.data.color);
                })
                .catch((error) =>{
                    this.setState({
                        imageColor: 'Something went wrong, please try again',
                        colorBack: true,
                        loading: false 
                    });
                    console.log('Error classifying car: '+error);
                });
        }
    }

    carHandler(e){
        //get whether its a car
        this.setState({
            colorBack: false,
            carProbability: null,
            imageColor: '',
            probabilityBack: false
        });
        if (this.state.imageID === null) {   
            console.log('Image Id not found');
            return;   
        } else {
            this.setState({
                loading: true,
                carProbability: null
            });
            axios.post('http://localhost:3001/classify/car_detector', { imageID: this.state.imageID }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) =>{
                    this.setState({
                        carProbability: response.data.probability,
                        probabilityBack: true,
                        loading: false 
                    });
                    console.log(this.state.carProbability);
                })
                .catch((error) =>{
                    this.setState({
                        carProbability: 'Something went wrong, please try again',
                        probabilityBack: true,
                        loading: false 
                    });
                    console.log('Error classifying car: '+error);
                });
        }
    }

    plateHandler(e){
        //extract plates from image
    }

    handleGoHome(e){
        this.setState({
            file: '',
            imagePreviewUrl: '',
            showImage: false,
            loading: false,
            response: null
        });
        window.location = '/home';
    }
    handleImageUpload() {
        this.setState({ loading: true });

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
    }
    
    handleImageChange(e) {
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[0];
    
        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result,
                showImage: true
            });
            this.handleImageUpload();
        };
    
        reader.readAsDataURL(file);
    }
    
    render() {
        const { classes } = this.props;

        return (
            <Grid container >
                <CssBaseline />
                <AppBar position="absolute" color="default" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" color="inherit" noWrap onClick={this.handleGoHome} style={{ cursor: 'pointer' }}>
                            Auto Car Classifier
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Grid className={classes.layout}>
                    <Paper className={classes.paper}>
                        <Typography component="h1" variant="h4" align="center">
                            Upload Image to classify
                        </Typography>
                        <Grid container item alignItems="center" justify="center" spacing={8}>
                            {this.state.showImage && <img src={this.state.imagePreviewUrl} className={classes.image} alt="Car Here"/>}
                        </Grid>
                        <Grid>
                            <Grid container alignItems="center" justify="center">
                                <input
                                    accept="image/*"
                                    className={classes.input}
                                    id="contained-button-file"
                                    multiple
                                    type="file"
                                    onChange={(e) => this.handleImageChange(e)} 
                                />
                                <label htmlFor="contained-button-file">
                                    <Button variant="outlined" component="span" align="center" className={classes.button}>
                                        Upload
                                        <CloudUploadIcon className={classes.cloudIcon} />
                                    </Button>
                                </label>
                            </Grid>
                            <Typography component="h6" variant="h6" align="center" className={classes.textBelowImage}>
                                Check image for: 
                            </Typography>
                            <Grid container direction="row" alignItems="center" justify="center" spacing={16}>
                                <Button variant="contained"
                                    component="span"
                                    color="primary"
                                    className={classes.buttons}
                                    onClick={this.carHandler}>
                                    Car 
                                </Button>
                                <Button variant="contained"
                                    component="span"
                                    color="primary"
                                    className={classes.buttons2}
                                    onClick={this.colorHandler}>
                                    Color 
                                </Button>
                                <Button variant="contained" component="span" color="primary" className={classes.buttons3}>
                                    Plates 
                                </Button>
                                <Grid container item alignItems="center" justify="center" spacing={8}>
                                    {this.state.probabilityBack && (this.state.probabilityBack && this.state.carProbability > 0.5 ? <img src={green_tick} className={classes.carSuccess} alt="Car Here"/> : <img src={small_error} className={classes.carSuccess} alt="Car Here"/>)}
                                </Grid>
                                <Grid>
                                    <Typography component="h6" variant="h6" align="center" className={classes.textBelowImage}>
                                        {this.state.probabilityBack && (this.state.probabilityBack && this.state.carProbability > 0.5 ? 'This is a car' : 'This is NOT a car')} 
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Typography component="h6" variant="h6" align="center" className={classes.textBelowImage}>
                                        {this.state.imageColor} 
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container alignItems="center" justify="center" spacing={8}>
                                {this.state.loading && <CircularProgress className={classes.progress} />}
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
CaptureImage.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CaptureImage);