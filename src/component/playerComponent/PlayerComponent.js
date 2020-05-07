import React from 'react';
import './PlayerComponent.css';
import {CookieManager} from "../../utils/CookieManager";
import axios from "axios";

export class PlayerComponent extends React.Component{

    constructor(props) {
        super(props);

        this.player = {};

        this.state = {
            minDonate: 0,
            donations: props.donations,
            // videos: ["https://www.youtube.com/watch?v=iDO9J_3OVJ0","https://www.youtube.com/watch?v=9u9ymiSmtXY"],
            videos: [],
        };
    }

    componentDidUpdate(prevProps) {
        this.props.donations !== prevProps.donations
        && this.updateDonations();
    }

    updateDonations = () => {
        let donations = this.props.donations;
        //console.log(donations);
        let lastDonationDate = CookieManager.getCookie("last_donation_date_player");
        if (lastDonationDate === undefined) {
            CookieManager.setCookie("last_donation_date_player", 0);
        }
        //console.log(lastDonationDate);
        //console.log(1);
        if (donations.length > 0) {
            CookieManager.setCookie("last_donation_date_player", donations[0].created_at);
            //console.log(2);
            let newDonations = [];
            let i = 0;
            while (donations[i].created_at > lastDonationDate) {
                newDonations.push(donations[i]);
                i++;
            }
            //console.log(3);
            let videosCopy = JSON.parse(JSON.stringify(this.state.videos));
            if (videosCopy === undefined || videosCopy === null || videosCopy === '') {
                videosCopy = [];
            }
            let emptyQueue = false;
            if (videosCopy.length === 0) emptyQueue = true;
            //console.log(4);

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
                    let playPos = text.indexOf('/play');
                    //console.log(5);
                    if (playPos !== -1) {
                        let nextSpace = text.indexOf(' ', playPos + 1);
                        let playUrl;
                        if (nextSpace !== - 1) {
                            playUrl = text.substring(playPos + 5, nextSpace + 1);
                        }
                        else {
                            playUrl = text.substring(playPos + 5);
                        }
                        //console.log(6);
                        if (playUrl !== undefined && playUrl !== null && playUrl !== '') {

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

                            if (sumInUSD >= this.state.minDonate) {
                                videosCopy = [...videosCopy, playUrl];
                            }
                        }
                        //console.log(7);
                    }
                }
                //console.log(8);
                this.saveVideosToCookie(videosCopy);

                console.log(videosCopy);

                if (videosCopy.length > 0 && emptyQueue) {
                    let video = videosCopy[0].replace("https://www.youtube.com/watch?v=", "");
                    this.player.loadVideoById(video);
                    this.setState({videos: videosCopy});
                }
                else this.setState({videos: videosCopy});

            }));
        }
    };

    componentDidMount() {
        console.log('player did mount');
        //console.log(this.player.current);
        //this.playVideo();
        //this.saveVideosToCookie();
        this.loadVideosFromCookie();
        this.loadMinDonationFromCookie();
        console.log(this.state.videos);
        //this.initPlayer();
    }

    init = () => {
        this.initPlayer();
    };

    loadVideosFromCookie = () => {
        let videosData = CookieManager.getCookie("videosData");
        if (videosData === undefined) videosData = "[]";
        let videos = JSON.parse(videosData);
        this.setState({videos: videos}, this.initPlayer);
    };

    loadMinDonationFromCookie = () => {
        let min = CookieManager.getCookie("minDonation");
        if (min === undefined) min = 0;
        console.log(min);
        this.setState({minDonate: min});
    };

    saveMinDonationToCookie = (minDonation) => {
        if (minDonation !== undefined) {
            CookieManager.setCookie("minDonation", JSON.stringify(minDonation));
        }
        else {
            CookieManager.setCookie("minDonation", JSON.stringify(this.state.videos));
        }
    };

    saveVideosToCookie = (customVideos) => {
        if (customVideos !== undefined) {
            CookieManager.setCookie("videosData", JSON.stringify(customVideos));
        }
        else {
            CookieManager.setCookie("videosData", JSON.stringify(this.state.videos));
        }
    };

    initPlayer = () => {
        console.log(this.state.videos);
        // On mount, check to see if the API script is already loaded

        if (!window.YT) { // If not, load the script asynchronously
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            // onYouTubeIframeAPIReady will load the video after the script is loaded
            window.onYouTubeIframeAPIReady = this.loadVideo;

            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        } else { // If script is already there, load the video directly
            this.loadVideo();
        }
    };

    loadVideo = () => {
        let config = {
            // videoId: this.state.videos[0].replace("https://www.youtube.com/watch?v=", ""),
            width: 720,
            height: 405,
            playerVars: {
                color: 'white',
                controls: 1,
                disableekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,

            },
            events: {
                onReady: this.onPlayerReady,
                onStateChange: this.onPlayerStateChange,
            },
        };

        console.log(this.state.videos);

        if (this.state.videos.length > 0) {
            config.videoId = this.state.videos[0].replace("https://www.youtube.com/watch?v=", "");
        }

        // the Player object is created uniquely based on the id in props
        this.player = new window.YT.Player(`player`, config);
    };

    onPlayerReady = event => {
        console.log('player ready' + this.state.videos);
        event.target.playVideo();
        //setTimeout(() => {this.player.cueVideoByUrl(this.state.videos[1])}, 5000)
    };

    onPlayerStateChange = event => {
        console.log(event.data);
        if (event.data === window.YT.PlayerState.ENDED) {
            this.setNewVideo();
        }
    };

    setNewVideo = () => {
        let video;
        if (this.state.videos.length > 1) {
            video = this.state.videos[1].replace("https://www.youtube.com/watch?v=", "");
        }
        else {
            video = "";
        }
        this.player.loadVideoById(video);
        let newVideos = this.state.videos.filter((elem, index) => index !== 0);
        this.saveVideosToCookie(newVideos);
        this.setState({videos: newVideos});
    };

    pauseVideo = () => {
        this.player.pauseVideo();
    };

    onSetMinDonationClick = () => {
        let minDonationInput = document.getElementById("min-donation-input");
        console.log(minDonationInput);
        let minDonation = minDonationInput.value;

        if (minDonation === undefined || minDonation === '' || minDonation === null) {
            minDonation = 0;
        }
        minDonation = +minDonation;

        this.saveMinDonationToCookie(minDonation);
        this.setState({minDonate: minDonation});
    };

    render() {
        console.log(this.state.minDonate);
        return(
            <div className="player-main">
                <div className="player-content">
                    <div id="player"></div>
                    <div>
                        <form>
                            <div className="form-group min-donation">
                                <input
                                    id="min-donation-input"
                                    value={this.state.minDonate}
                                    type="text"
                                    className="form-control"
                                    onChange={e => this.setState({ minDonate: +e.target.value })}
                                    placeholder="Min donation"/>
                                <button onClick={this.onSetMinDonationClick} type="button" className="btn btn-light">Set min donation</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="player-side">
                    {this.state.videos.map((video, index) =>
                        <div key={index}>
                            <h6 style={{color: 'white',}}>{video}</h6>
                            <hr style={{backgroundColor: 'white', height: '2px',}}/>
                        </div>
                    )}
                </div>
            </div>
        );
    }


}