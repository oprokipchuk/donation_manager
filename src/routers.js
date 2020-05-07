import React from 'react';
import {Route, Switch} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import {AuthManager} from "./component/authManager/AuthManager";
import {Logout} from "./component/logout/Logout";
import {ContentPage} from "./component/contentPage/ContentPage";

export class Routers extends React.Component{
    render() {
        return(
            <BrowserRouter>
                <Switch>
                    <Route path="/login" component={AuthManager}/>
                    <Route path="/logout" component={Logout}/>
                    <Route exact path="/" component={() => {window.location.replace("/donations")}}/>
                    <Route path="/:content" component={ContentPage}/>
                </Switch>
            </BrowserRouter>
        );
    }
}