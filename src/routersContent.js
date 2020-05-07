import React from 'react';
import {Route, Switch} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {HomeComponent} from "./component/home/HomeComponent";
import {AuthManager} from "./component/authManager/AuthManager";

export class RoutersContent extends React.Component{
    render() {
        return(
            <BrowserRouter>
                <Switch>
                    <Route path="/donations" component={HomeComponent}/>
                    <Route path="/player" component={AuthManager}/>
                    <Route path="/poll" component={"poll"}/>
                </Switch>
            </BrowserRouter>
        );
    }
}