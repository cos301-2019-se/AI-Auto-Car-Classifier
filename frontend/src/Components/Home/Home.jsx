import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Home extends React.PureComponent {
    render() {
        return <section>{this.props.homeState.message}</section>;
    }
}

Home.propTypes = {
    homeState: PropTypes.shape({
        message: PropTypes.string.isRequired
    })
};

const mapStateToProps = (state) => {
    return {
        homeState: state.homeState
    };
};

export default connect(mapStateToProps)(Home);