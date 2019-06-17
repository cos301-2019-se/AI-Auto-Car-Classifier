import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import React from 'react';
import Signin from '../Components/Shared/Signin/Signin.jsx';
//import CaptureImage from '../Components/CaptureImage/CaptureImage.jsx';
import Home from '../Components/Home/Home';

const Routes = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/signin" exact component={Signin}/>
                <Route path="/home" exact component={Home}/>
                <Route render={() => <Redirect to="/signin"/>}/>
            </Switch>
        </BrowserRouter>
    );
};

export default Routes;