import React from 'react';
import axios from "../../utils/AxiosConfiguration";
import {CookieManager} from "../../utils/CookieManager";

export class Logout extends React.Component{

    constructor(props) {
        super(props);

        this.urlBase = 'https://donation-manager-server.herokuapp.com';
        this.port = '8080';

    }

    componentDidMount() {
        this.loadUser().then(this.logout);
    }

    loadUser = () => {
        let getUserUrl = `${this.urlBase}/api/v1/user`;
        return axios.get(getUserUrl, {withCredentials: true})
            .catch(() => {this.props.history.push("/login")});
    };

    logout = () => {
        let logoutUrl = `${this.urlBase}/logout`;
        axios.get(logoutUrl, {withCredentials: true})
            .then(() => {
                this.deleteTokenCookie();
                this.updateAxiosHeaders();
                this.props.history.push("/login")
            });
    };

    updateAxiosHeaders = () => {
        axios.defaults.headers.common = {'Authorization': `Bearer ${CookieManager.getCookie("client-access-token")}`};

    };

    deleteTokenCookie = () => {
        this.setCookie("client-access-token", "", {
            'max-age': -1
        })
    };

    setCookie = (name, value, options = {}) => {

        options = {
            path: '/',
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    };

    render() {
        return(
            <div>Logout</div>
        );
    }


}