import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import red from '@material-ui/core/colors/red';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import styles from '../CaptureImage/CaptureImageStyles';

class ResultComponent extends React.Component {
  state = { expanded: false };
  constructor(props){
      super(props);
      this.handleExpandClick = this.handleExpandClick.bind(this);
  }
  handleExpandClick(){
      this.setState(state => ({ expanded: !state.expanded }));
  }

  render() {
      const { classes } = this.props;

      return (
          <main className={classes.layout}>
              <Card className={classes.card}>
                  <CardHeader
                      avatar={
                          <Avatar aria-label="Recipe" className={classes.avatar}>
                            R
                          </Avatar>
                      }
                      action={
                          <IconButton>
                              <MoreVertIcon />
                          </IconButton>
                      }
                      title="Image classification results"
                      subheader="Auto Car Classifier"
                  />
                  <CardMedia
                      className={classes.media}
                      image={this.props.image}
                      title="Submitted Image"
                  />
                  <CardContent>
                      <Typography component="p">
                          {this.props.classificationResults ? this.props.classificationResults: 'Something went wrong'}
                      </Typography>
                  </CardContent>
                  <CardActions className={classes.actions} disableActionSpacing>
                      <IconButton aria-label="Correct result?">
                          <FavoriteIcon />
                      </IconButton>
                      <IconButton aria-label="Share result">
                          <ShareIcon />
                      </IconButton>
                      <IconButton
                          className={classnames(classes.expand, {
                              [classes.expandOpen]: this.state.expanded,
                          })}
                          onClick={this.handleExpandClick}
                          aria-expanded={this.state.expanded}
                          aria-label="Show more"
                      >
                          <ExpandMoreIcon />
                      </IconButton>
                  </CardActions>
                  <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                      <CardContent>
                          <Typography paragraph>Method:</Typography>
                          <Typography paragraph>
                                This classification was peformed using a convolutional neural network.
                          </Typography>
                      </CardContent>
                  </Collapse>
              </Card>
          </main>
      );
  }
}

ResultComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    classificationResults: PropTypes.object,
    image: PropTypes.object
};

export default withStyles(styles)(ResultComponent);