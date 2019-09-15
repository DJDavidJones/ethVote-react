import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";

class Elections extends Component {
    state = {
        loading: true,
        metamask: false
    };

    async componentDidMount() {
        await this.loadBlockchainData();
    }

    render() {
        const { loading, metamask } = this.state;
        return (
            <React.Fragment>
                {loading ? (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                ) : metamask ? (
                    <h1>Welcome</h1>
                ) : (
                    <Redirect to="/metamask" />
                )}
            </React.Fragment>
        );
    }

    async loadBlockchainData() {
        try {
            await window.web3.currentProvider.enable();
            this.setState({ web3: new Web3(window.web3.currentProvider) });
            await this.getRegistrationAuthority();
            await this.getElectionFactory();
            this.setState({ loading: false, metamask: true });
        } catch (err) {
            this.setState({ loading: false, metamask: false });
        }
    }

    async getRegistrationAuthority() {
        const { web3 } = this.state;
        const address = "0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ registrationAuthority: contract });
    }

    async getElectionFactory() {
        const { web3 } = this.state;
        const address = "0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05";
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        this.setState({ electionFactory: contract });
    }
}

export default Elections;
