import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles, Button, TextField, CircularProgress } from '@material-ui/core';
import { Paper } from '@material-ui/core'
import { withRouter } from 'react-router-dom';
import * as HomeActions from './HomeActions';
import { bindActionCreators } from 'redux';
import styles from './HomeStyles';
import NavBar from '../Shared/NavBar/NavBar';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

class Home extends React.PureComponent {

    constructor(props){
        super(props);
        this.state = {
            file: null
        };
        this.handleImageUpload = this.handleImageUpload.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleCarDetails = this.handleCarDetails.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    handleInputChange(e){
        this.props.updateCarDetails({
            ...this.props.carDetails,
            [e.target.name]: e.target.value
        });
    }

    handleImageUpload(e){
        const ZERO = 0;
        e.preventDefault();
        let reader = new FileReader();
        let file = e.target.files[ZERO];
    
        reader.onloadend = () => {
            this.setState({
                file: reader.result,
            });
            this.props.updateImage(reader.result);
            this.props.uploadImage(this.state.file);
        };
    
        reader.readAsDataURL(file);
    }
    
    handleSave(){
        /**
         * @TODO this funtion should save the car data to some db
         * 
         */
        console.log(this.props.carDetails);
    }

    handleCarDetails(){
        if (this.props.imageID === ''){
            return;
        }

        this.props.getCarDetails(this.props.imageID);
    }

    render() {
        const { classes } = this.props;
        return <div>
            <NavBar />
            <Grid container direction="row">
                <Grid
                    item
                    direction={'column'} 
                    justify={'flex-start'}
                    alignItems={'flex-start'}>
                    <Paper className={classes.imageWrapper}>
                        <Grid
                            container 
                            item
                            direction={'column'} 
                            justify={'center'}
                            alignItems={'center'}>
                            {
                                this.props.image === '' ? '' : <img src={this.state.file} alt={'Not uploaded'} className={classes.image}></img>
                            }
                        </Grid>
                    </Paper>
                </Grid>
                <Grid direction={'column'}
                    justify={'flex-end'}
                    alignItems={'flex-end'}>
                    <Grid item 
                        direction={'column'}
                        justify={'flex-end'}
                        alignItems={'flex-start'}>
                        <Paper className={classes.resultsWrapper}>
                            
                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Make </text>
                                <TextField className={classes.textFields}
                                    value={this.props.carDetails.make}
                                    onChange={this.props.updateCarDetails}
                                />    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Model </text>
                                <TextField className={classes.textFields}
                                    value={this.props.carDetails.model}
                                    onChange={this.props.updateCarDetails}/>    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Year </text>
                                <TextField className={classes.textFields}
                                    value={this.props.carDetails.year}
                                    onChange={this.props.updateCarDetails} />    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Color </text>
                                <TextField className={classes.textFields} 
                                    value={this.props.carDetails.color}
                                    onChange={this.props.updateCarDetails} />
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Body Style </text>
                                <TextField className={classes.textFields}
                                    value={this.props.carDetails.bodyStyle}
                                    onChange={this.props.updateCarDetails} />    
                            </Grid>
                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Number Plate </text>
                                <TextField className={classes.textFields} 
                                    value={this.props.carDetails.numberPlate}
                                    onChange={this.props.updateCarDetails} />  
                            </Grid>
                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Description </text>
                                <textarea className={classes.description} 
                                    value={this.props.carDetails.description}
                                    onChange={this.props.updateCarDetails} />
                            </Grid>        
                        </Paper>
                    </Grid>
                    <Grid item 
                        direction={'column'}
                        justify={'flex-end'}
                        alignItems={'flex-end'}>
                        <Button variant="contained" color="primary"
                            className={classes.inventoryButton}
                            onClick={this.handleSave}>
                            Send to inventory
                        </Button>
                    </Grid>

                </Grid>
                <Grid container
                    direction="row"
                    className={classes.bottomButtons}>
                    <Grid
                        item
                        direction={'column'}
                        alignItems="flex-start"
                        justify="flex-start">
                        <input
                            accept="image/*"
                            className={classes.hiddenInput}
                            id="contained-button-file"
                            multiple
                            type="file"
                            onChange={(e) => this.handleImageUpload(e)} 
                        />
                        <label htmlFor="contained-button-file">
                            <Button variant="outlined" component="span" align="center" className={classes.button}>
                                            Upload
                                <CloudUploadIcon className={classes.uploadButton} />
                            </Button>
                        </label>
                    </Grid>
                    <Grid
                        item
                        direction={'column'}
                        alignItems="flex-end"
                        justify="flex-end">
                        <Button variant="contained"
                            component="span"
                            color="primary"
                            className={classes.classifyButton}
                            onClick={this.handleCarDetails}>
                            {this.props.loading ? <CircularProgress color={'secondary'} size={25} className={classes.loader} /> : 'Get Car details'} 
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </div>;
    }
}

Home.propTypes = {
    classes: PropTypes.object,
    carDetails: PropTypes.object,
    image: PropTypes.string,
    imageID: PropTypes.string,
    loading: PropTypes.bool,
    uploadImage: PropTypes.func.isRequired,
    updateCarDetails: PropTypes.func.isRequired,
    updateImage: PropTypes.func.isRequired,
    getCarDetails: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    carDetails: state.homeState.carDetails,
    loading: state.homeState.loading,
    image: state.homeState.image,
    imageID: state.homeState.imageID
});

const mapActionsToProps = (dispatch) => ({
    uploadImage: bindActionCreators(HomeActions.uploadImage, dispatch),
    updateCarDetails: bindActionCreators(HomeActions.updateCarDetails, dispatch),
    updateImage: bindActionCreators(HomeActions.updateImage, dispatch),
    getCarDetails: bindActionCreators(HomeActions.getCarDetails, dispatch)
});

export default withRouter(connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Home)));