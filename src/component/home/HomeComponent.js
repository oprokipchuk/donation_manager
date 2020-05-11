import React from 'react';
import axios from '../../utils/AxiosConfiguration';
import './HomeComponent.css';

export class HomeComponent extends React.Component{

    constructor(props) {
        super(props);

        this.donationsGetUrl = 'https://donation-manager-server.herokuapp.com/api/v1/donation';
        this.authorizationUrl = 'https://streamlabs.com/api/v1.0/authorize';

        this.authorizationData = {
            scopes: 'donations.read',
            client_id: 'GCpoofjBScH9YkE7eB5OdMsxPLUSj8JVPzLTQVHV',
            redirect_server_uri: 'https://donation-manager-server.herokuapp.com/auth',
            response_type: 'code',
        };

        this.state = {
            donations: this.props.donations,
        }
    }

    componentDidMount() {
    }

    authorization = () => {
        let params = `toolbar=no,menubar=no, width=500,height=500,left=300,top=300`;

        let authStr = `${this.authorizationUrl}?response_type=code&`
            + `client_id=${this.authorizationData.client_id}&`
            + `redirect_uri=${this.authorizationData.redirect_server_uri}&`
            + `scope=${this.authorizationData.scopes}`;

        let authWindow = window.open(authStr, 'StreamLabs authorization', params);
    };

    loadDonations = () => {
        let requestConfig = {
            withCredentials : true,
        };
        axios.get(this.donationsGetUrl, {withCredentials: true})
            .then((response) => this.setState({donations: response.data}));
    };


    render() {
        return(
            <div className="donation-list list-group">
                <h1 style={{color:"white"}}>Donations</h1>
                <div className="donation-list-header">
                    <p className="donation-list-elem-username">User name</p>
                    <p className="donation-list-elem-amount">Amount</p>
                    <p className="donation-list-elem-message">Message</p>
                    <p className="donation-list-elem-datetime">Date time</p>
                </div>
                {this.props.donations.map((donation) =>
                    <a key={donation.id} href="#" className="list-group-item list-group-item-action flex-column align-items-start active">
                        <div className="d-flex w-100 justify-content-between">
                            <p className="donation-list-elem-username">{donation.username}</p>
                            <p className="donation-list-elem-amount">{donation.amount + " " + donation.currency}</p>
                            <p className="donation-list-elem-message">{donation.message}</p>
                            <p className="donation-list-elem-datetime">{new Date(donation.created_at*1000).toUTCString()}</p>
                        </div>
                    </a>
                )}
            </div>
        );
    }


}