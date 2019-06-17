import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import styles from './NavBarStyles';

class NavBar extends React.PureComponent {
    render() {
        const { classes } = this.props;
        return <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="Menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                    AI Auto Car Classifier
                </Typography>
            </Toolbar>
        </AppBar>;
    }
}

NavBar.propTypes = {
    classes: PropTypes.object
};

const mapStateToProps = state => ({

});

const mapActionsToProps = (dispatch) => ({

});

export default withRouter(connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(NavBar)));