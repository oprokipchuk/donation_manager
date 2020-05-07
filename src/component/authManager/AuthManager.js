import React from 'react';
import './AuthManager.css';
import axios from "axios";
import {CookieManager} from "../../utils/CookieManager";

export class AuthManager extends React.Component{

    constructor(props) {
        super(props);

        this.urlBase = 'http://localhost';
        this.port = '8080';

        this.state = {
            loginError: false,
            registerError: "",
        };
    }

    componentDidMount() {
        this.loadUser();
    }

    loadUser = () => {
        let getUserUrl = `${this.urlBase}:${this.port}/api/v1/user`;
        axios.get(getUserUrl, {withCredentials: true})
            .then(() => {this.props.history.push("/donations")});
    };

    onLogin = (event) => {
        let querystring = require('querystring');
        let loginForm = event.target.parentElement;
        let loginUrl = `${this.urlBase}:${this.port}/jwt/auth`;
        let loginData = {
            username: loginForm.username.value,
            password: loginForm.password.value,
        };
        let loginConfig = {
            headers: {Authorization: ""},
            withCredentials: true
        };
        return axios.post(loginUrl, loginData, loginConfig)
            .then((response) => {
                this.setTokenCookie(response.data['access_token']);
                this.updateAxiosHeaders();
                this.props.history.push("/donations");
            })
            .catch(() => this.setState({loginError: true}));
    };

    updateAxiosHeaders = () => {
        axios.defaults.headers.common = {'Authorization': `Bearer ${CookieManager.getCookie("client-access-token")}`};

    };

    setTokenCookie = (jwt) => {
        document.cookie=`client-access-token=${jwt}; path=/; max-age=36000000;`;
    };

    onRegister = (event) => {
        let registerForm = event.target.parentElement;
        let registerUrl = `${this.urlBase}:${this.port}/register`;
        let registerData = {
            email: registerForm.username.value,
            password: registerForm.password.value,
            fullName: registerForm.fullName.value,
            birthDate: registerForm.birthDate.value,
        };
        let registerConfig = {
            headers: {Authorization: ""},
            withCredentials: true,
        };
        return axios.post(registerUrl, registerData, registerConfig)
            .then(() => {this.props.history.push("/donations")})
            .catch((error) => {
                if (error.response.data.errors !== undefined) this.setState({registerError: error.response.data.errors[0].defaultMessage});
                else if (error.response.data.message !== undefined) this.setState({registerError: error.response.data.message});
            });
    };

    RenderLoginError = () => {
        console.log("in render error");
        if (this.state.loginError === true) {
            console.log("return error");
            return (
                <div className="alert alert-danger" role="alert">
                    Incorrect login or password!
                </div>
            );
        }
        else return (<div></div>);
    };

    RenderRegisterError = () => {
        console.log("in render error");
        if (this.state.registerError !== "") {
            console.log("return error");
            return (
                <div className="alert alert-danger" role="alert">
                    {this.state.registerError}
                </div>
            );
        }
        else return (<div></div>);
    };

    render() {
        return(
            <div>
                <div className="auth-block login-main">
                    <div className="login-form">
                        <form>
                            <this.RenderLoginError/>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="username" type="email" className="form-control" placeholder="example@example.com"/>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input name="password" type="password" className="form-control" placeholder="Password"/>
                            </div>
                            <button onClick={this.onLogin} type="button" className="login-btn btn btn-black">Login</button>
                        </form>
                    </div>
                </div>
                <div className="auth-block register-main">
                    <div className="login-form">
                        <form>
                            <this.RenderRegisterError/>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="username" type="email" className="form-control" placeholder="example@example.com"/>
                            </div>
                            <div className="form-group">
                                <label>Full name</label>
                                <input name="fullName" type="text" className="form-control" placeholder="John Smith"/>
                            </div>
                            <div className="form-group">
                                <label>Birth date</label>
                                <input name="birthDate" type="date" className="form-control"/>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input name="password" type="password" className="form-control" placeholder="Password"/>
                            </div>
                            <button onClick={this.onRegister} type="button" className="btn btn-secondary">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

}