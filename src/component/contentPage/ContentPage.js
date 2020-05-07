import React from 'react';
import './ContentPage.css';
import {RoutersContent} from "../../routersContent";
import {HomeComponent} from "../home/HomeComponent";
import axios from "../../utils/AxiosConfiguration";
import {PollComponent} from "../pollComponent/PollComponent";
import {PlayerComponent} from "../playerComponent/PlayerComponent";

export class ContentPage extends React.Component{

    constructor(props) {
        super(props);

        this.urlBase = "https://donation-manager-server.herokuapp.com";
        this.donationsGetUrl = 'https://donation-manager-server.herokuapp.com/api/v1/donation';
        this.authorizationUrl = 'https://streamlabs.com/api/v1.0/authorize';
        this.port = "8080";

        this.donationRefreshTime = 5000;

        this.donationRefreshTimeout = '';

        this.authorizationData = {
            scopes: 'donations.read',
            client_id: 'GCpoofjBScH9YkE7eB5OdMsxPLUSj8JVPzLTQVHV',
            redirect_server_uri: 'https://donation-manager-server.herokuapp.com/auth',
            response_type: 'code',
        };

        this.state = {
            lastDonationDate: 0,
            content: props.match.params.content,
            donations: [],
            providers: [],
        };

    }

    componentDidUpdate(prevProps) {
        this.setFullHeight();
    }

    componentDidMount() {
        this.loadUser()
            .then(() => {this.loadProviders()
            .then(() => {this.loadDonations()
            .finally(() =>
                {this.donationRefreshTimeout
                    = setTimeout(this.donationRefreshFunc, this.donationRefreshTime)})})});
    }

    setFullHeight = () => {
        var body = document.body,
            html = document.documentElement;

        //console.log(body.scrollHeight);
        //console.log(body.offsetHeight);
        //console.log(html.clientHeight);
        //console.log(html.scrollHeight);
        //console.log(html.offsetHeight);

        var height = Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );

        let side = document.getElementById("content-side");
        let main = document.getElementById("content-main");
        //console.log(side);
        //side.style.height = document.body.scrollHeight + 'px';
        main.style.height = height + 'px';
    };

    donationRefreshFunc = () => {
        this.loadDonations()
            .then((response) => {
                /*let donations = response.data.donations;
                if (donations > 0) {
                    let newDonations = [];
                    let i = 0;
                    while (donations[i].created_at > this.state.lastDonationDate) {
                        newDonations.push(donations[i]);
                    }
                }*/
            })
            .finally(() => {
            this.donationRefreshTimeout = setTimeout(this.donationRefreshFunc, this.donationRefreshTime);
        });
    };

    loadUser = () => {
        let getUserUrl = `${this.urlBase}/api/v1/user`;
        return axios.get(getUserUrl, {withCredentials: true})
            .catch(() => {this.props.history.push("/login")});
    };

    loadProviders = () => {
        let reuestConfig = {
            withCredentials: true,
        };
        let loadProvidersUrl = "https://donation-manager-server.herokuapp.com/api/v1/providers";
        return axios.get(loadProvidersUrl, reuestConfig)
            .then((response) => this.setState({
                providers: response.data.map((provider) => {return {
                    id: provider.id,
                    name: provider.name,
                    authUrl: provider.authUrl,
                    status: 3,
                };})
            }));
    };

    loadDonations = () => {
        let requestConfig = {
            withCredentials : true,
        };
        return axios.get(this.donationsGetUrl, requestConfig)
            .then((response) => {
                let donationsDate;
                if (response.data.donations.length > 0 && response.data.donations[0].created_at > this.state.lastDonationDate) {
                    donationsDate = response.data.donations[0].created_at;
                }
                else {
                    donationsDate = this.state.lastDonationDate;
                }
                if (response.data.okProviders.length === 0) {
                    this.setState({
                        lastDonationDate: donationsDate,
                        donations: response.data.donations,
                        providers: this.state.providers.map((provider) => {return {
                            id: provider.id,
                            name: provider.name,
                            authUrl: provider.authUrl,
                            status: 2,
                        }}),
                    });
                }
                else {
                    this.setState({
                        lastDonationDate: donationsDate,
                        donations: response.data.donations,
                        providers: this.state.providers.map((provider) => {
                            if (response.data.okProviders.includes(provider.id)) return {
                                id: provider.id,
                                name: provider.name,
                                authUrl: provider.authUrl,
                                status: 1,
                            };
                            else return {
                                id: provider.id,
                                name: provider.name,
                                authUrl: provider.authUrl,
                                status: 2,
                            };
                        }),
                    });
                }
            })
            .catch(() => {
                this.setState({
                    providers: this.state.providers.map((provider) => {return {
                        id: provider.id,
                        name: provider.name,
                        authUrl: provider.authUrl,
                        status: 2,
                    }}),
                });
            });
    };

    onDonations = () => {
        this.props.history.push("/donations");
        this.setState({content: "donations"})
    };

    onPlayer = () => {
        this.props.history.push("/player");
        this.setState({content: "player"})
    };

    onPoll = () => {
        this.props.history.push("/poll");
        this.setState({content: "poll"})
    };

    getComponentByUrl = () => {
        if (this.state.content === 'donations') return <HomeComponent donations={this.state.donations}/>;
        else if (this.state.content === 'player') return <div><PlayerComponent donations={this.state.donations}/></div>;
        else if (this.state.content === 'poll') return <div><PollComponent donations={this.state.donations}/></div>;
        else return <div></div>;
    };

    onProviderClick = () => {
        let params = `toolbar=no,menubar=no, width=500,height=500,left=300,top=300`;

        let authStr = `${this.authorizationUrl}?response_type=code&`
            + `client_id=${this.authorizationData.client_id}&`
            + `redirect_uri=${this.authorizationData.redirect_server_uri}&`
            + `scope=${this.authorizationData.scopes}`;

        let authWindow = window.open(authStr, 'StreamLabs authorization', params);
    };

    render() {
        return(
            <div id="content-main" className="content-page">
                <div className="content-page-main">
                    <div className="main-tabs">
                        <div onClick={this.onDonations} className="btn btn-outline-dark main-tab main-active">Donations</div>
                        <div onClick={this.onPlayer} className="btn btn-outline-dark main-tab main-active">Player</div>
                        <div onClick={this.onPoll} className="btn btn-outline-dark main-tab main-active">Poll</div>
                    </div>
                    {this.getComponentByUrl()}
                </div>
                <div id="content-side" className="content-page-side-bar">
                    {this.state.providers.map(provider =>
                        <div
                            onClick={this.onProviderClick}
                            key={provider.id}
                            className={"provider provider-" + provider.status}
                            data-link={provider.authUrl}>
                            {provider.name}
                        </div>
                    )}
                </div>
            </div>
        );
    }

}