import React from 'react';
import './PollComponent.css';
import {CookieManager} from "../../utils/CookieManager";
import axios from 'axios';

export class PollComponent extends React.Component{

    constructor(props) {
        super(props);

        this.currencyApiKey = 'c0153baab4c75ea86e3b80971ad10062';

        this.state = {
            donations: props.donations,
            pollMode: "runtime",
            pollCreationVariantsAmount: 1,
            lastPollDonationDate: 0,
            poll: {},
        }
    }

    componentDidUpdate(prevProps) {
        this.props.donations !== prevProps.donations
        && this.updateDonations();
    }

    updateDonations = () => {
        let donations = this.props.donations;
        let lastDonationDate = CookieManager.getCookie("last_donation_date_poll");
        if (donations.length > 0) {
            CookieManager.setCookie("last_donation_date_poll", donations[0].created_at);
            let newDonations = [];
            let i = 0;
            while (donations[i].created_at > lastDonationDate) {
                newDonations.push(donations[i]);
                i++;
            }
            let cookieData = CookieManager.getCookie("pollData");
            if (cookieData === undefined) cookieData = "{}";
            let pollCopy = JSON.parse(cookieData);

            if (newDonations.length === 0) return;

            axios.get(`https://cors-anywhere.herokuapp.com/https://api.exchangeratesapi.io/latest`, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    authorization: '',
                },
            }).then((response => {

                let currencies = response.data;
                console.log(response.data);

                for (let j = 0; j < newDonations.length; j++) {
                    let text = newDonations[j].message;
                    let votePos = text.indexOf('/vote');
                    if (votePos !== -1) {
                        let nextSpace = text.indexOf(' ', votePos + 1);
                        let voteNum;
                        if (nextSpace !== - 1) {
                            voteNum = text.substring(votePos + 5, nextSpace + 1);
                        }
                        else {
                            voteNum = text.substring(votePos + 5);
                        }
                        if (+voteNum > 0 && pollCopy.name !== undefined && voteNum <= pollCopy.variants.length) {

                            let sumInUSD;

                            if (newDonations[j].currency === 'USD') {
                                sumInUSD = newDonations[j].amount;
                            }
                            else {
                                console.log(newDonations[j].amount);
                                console.log(newDonations[j].amount);
                                sumInUSD = newDonations[j].amount/currencies.rates[newDonations[j].currency]*currencies.rates.USD;
                                sumInUSD = Math.round((sumInUSD + Number.EPSILON) * 100) / 100;
                            }

                            pollCopy.sum += sumInUSD;
                            pollCopy.variants[voteNum - 1].variantValue += sumInUSD;
                        }
                    }
                }
                this.savePollToCookie(pollCopy);
                this.setState({poll: pollCopy});

            }));
        }
    };

    componentDidMount() {
        this.loadPollFromCookie();
        //this.savePollToCookie();
    }

    loadPollFromCookie = () => {
        let cookieData = CookieManager.getCookie("pollData");
        if (cookieData === undefined) cookieData = "{}";
        this.setState({
            poll: JSON.parse(cookieData)
        })
    };

    savePollToCookie = (customPoll) => {
        if (customPoll !== undefined) {
            CookieManager.setCookie("pollData", JSON.stringify(customPoll));
        }
        else {
            CookieManager.setCookie("pollData", JSON.stringify(this.state.poll));
        }
    };

    onDeletePollClick = () => {
        CookieManager.setCookie("pollData", "{}");
        this.setState({poll: {}});
    };

    onAddPollClick = () => {
        this.setState({
            pollCreationVariantsAmount: 1,
            pollMode: "creation"
        });
    };

    renderButtonSection = () => {
        if (this.state.pollMode === 'creation') return <div> </div>;
        if (this.state.poll.name !== undefined) {
            return(
                <div className="poll-button-section">
                    <button onClick={this.onDeletePollClick} type="button" className="btn btn-outline-danger">Delete poll</button>
                </div>
            );
        }
        return (
            <div className="poll-button-section">
                <button onClick={this.onAddPollClick} type="button" className="btn btn-outline-success">Add poll</button>
            </div>
        );
    };

    renderMainPart = () => {
        if (this.state.pollMode === 'runtime') return this.renderPollSection();
        else return this.renderPollCreationSection();
    };

    renderPollSection = () => {
        if (this.state.poll.name !== undefined) {
            return(
                <div className="poll-content-section">
                    <h3>{this.state.poll.name}</h3>
                    <h4>Sum: {this.state.poll.sum}</h4>
                    {this.state.poll.variants.map((variant, i) =>
                        <div key={i} className="poll-progress-bar-back">
                            <div className="poll-progress-bar-front" style={{width: 100*variant.variantValue/this.state.poll.sum + "%"}}>
                                {variant.variantName + " : " + variant.variantValue}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div> </div>
        );
    };

    renderVariants = () => {
        return [...Array(this.state.pollCreationVariantsAmount)].map(
            (e, i) =>
                <div className="form-group" key={i}>
                    <label>Variant</label>
                    <input type="text" className="form-control" placeholder="Variant"/>
                </div>
        );
    };

    onAddVariant = () => {
        this.setState({
            pollCreationVariantsAmount: this.state.pollCreationVariantsAmount + 1,
        });
    };

    onCreateVariant = (e) => {
        let form = e.target.parentElement;
        let inputs = form.getElementsByTagName("input");

        console.log(inputs);
        let poll = {
            sum: 0,
            name: inputs[0].value,
            variants: [...inputs].filter((e, i) => i !== 0).map((e, i) => {return {
                variantName: this.handleVariantValue(e.value, i),
                variantValue: 0,
            }})
        };

        this.savePollToCookie(poll);

        this.setState({
            poll: poll,
            pollMode: 'runtime',
        });
    };

    handleVariantValue = (variant, index) => {
        if (variant !== undefined && variant !== null) return variant;
        else return '' + (index + 1);
    };

    renderPollCreationSection = () => {
        return(
            <form className="form-poll-create">
                <div className="form-group">
                    <label>Poll name</label>
                    <input type="text" className="form-control" id="poll-name-input" placeholder="Enter poll name"/>
                </div>
                {this.renderVariants()}
                <button onClick={this.onCreateVariant} type="button" className="btn btn-light">Create</button>
                <button onClick={this.onAddVariant} type="button" className="btn btn-light">Add variant</button>
            </form>
        );
    };

    render() {
        return(
            <div className="poll-main">
                {this.renderButtonSection()}
                {this.renderMainPart()}
            </div>
        );
    }


}