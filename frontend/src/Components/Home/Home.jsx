import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles, Button, TextField } from '@material-ui/core';
import { Paper } from '@material-ui/core'
import { withRouter } from 'react-router-dom';
import * as HomeActions from './HomeActions';
import { bindActionCreators } from 'redux';
import styles from './HomeStyles';
import NavBar from '../Shared/NavBar/NavBar';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { DropzoneArea } from 'material-ui-dropzone'

class Home extends React.PureComponent {

    constructor(props){
        super(props);
        this.state = {
            file: null
        };
        this.handleImageUpload = this.handleImageUpload.bind(this);
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

            this.props.uploadImage();
        };
    
        reader.readAsDataURL(file);
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
                                <TextField className={classes.textFields}></TextField>    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Model </text>
                                <TextField className={classes.textFields}></TextField>    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Year </text>
                                <TextField className={classes.textFields}></TextField>    
                            </Grid>

                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Body Type </text>
                                <TextField className={classes.textFields}></TextField>    
                            </Grid>
                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Number Plate </text>
                                <TextField className={classes.textFields}></TextField>    
                            </Grid>
                            <Grid
                                container
                                item
                                direction={'row'}
                                justify={'flex-start'}
                                alignItems={'flex-start'}
                            >
                                <text className={classes.labels}>Description </text>
                                <textarea className={classes.description}></textarea>  
                            </Grid>        
                        </Paper>
                    </Grid>
                    <Grid item 
                        direction={'column'}
                        justify={'flex-end'}
                        alignItems={'flex-end'}>
                        <Button variant="contained" color="primary"
                            className={classes.inventoryButton}>
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
                            onClick={this.colorHandler}>
                            Get Car details 
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </div>;
    }
}

Home.propTypes = {
    classes: PropTypes.object
};

const mapStateToProps = state => ({

});

const mapActionsToProps = (dispatch) => ({
    uploadImage: bindActionCreators(HomeActions.uploadImage, dispatch)
});

export default withRouter(connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(Home)));