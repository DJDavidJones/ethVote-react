import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import Election from "../ethereum/Election.json";
import ElectionMenu from "./electionComponents/ElectionMenu";
import ElectionCards from "./electionComponents/ElectionCards";
import NotRegisteredWarning from "./electionComponents/NotRegisteredWarning";

class Elections extends Component {
    state = {
        redirect: false,
        showLoader: true,
        userIsRegisteredVoter: false,
        activeItem: "current",
        elections: []
    };

    async componentDidMount() {
        await this.loadAllRelevantData();
    }

    async loadAllRelevantData() {
        let web3, regAuthority, electionFactory;
        try {
            // Get Web3 and contracts
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            regAuthority = this.getRegistrationAuthority(web3);
            electionFactory = this.getElectionFactory(web3);

            // Get Elections
            const addresses = await electionFactory.methods
                .getDeployedElections()
                .call();

            const userAddresses = await web3.eth.getAccounts();

            // forEach doesn't await all instructions
            // See: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
            await Promise.all(
                addresses.map(async e => {
                    const contract = this.getElectionContract(web3, e);
                    const contractDetails = {
                        address: await contract._address,
                        title: await contract.methods.title().call(),
                        description: await contract.methods
                            .description()
                            .call(),
                        startTime: await contract.methods.startTime().call(),
                        timeLimit: await contract.methods.timeLimit().call(),
                        userHasVoted: await contract.methods
                            .hasVoted(userAddresses[0])
                            .call()
                    };

                    this.setState({
                        elections: [...this.state.elections, contractDetails]
                    });
                })
            );

            // Check if user is a regsitered voter
            const registered = await regAuthority.methods
                .voters(userAddresses[0])
                .call();

            this.setState(function(prevState, props) {
                return {
                    showLoader: false,
                    web3,
                    regAuthority,
                    electionFactory,
                    userIsRegisteredVoter: registered
                };
            });
        } catch (err) {
            this.setState(function(prevState, props) {
                return { redirect: true };
            });
        }
    }

    getRegistrationAuthority(web3) {
        const address = "0x74F3F1d24c4bE46e1ef261f48EA87768831cA2C2";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionFactory(web3) {
        const address = "0xdCaCCc422B7A2d580Ccaa95909b6A9B2E5b0fc05";
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionContract(web3, address) {
        const abi = JSON.parse(Election.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name });

    render() {
        return (
            <React.Fragment>
                {this.state.userIsRegisteredVoter === false &&
                this.state.showLoader === false ? (
                    <NotRegisteredWarning />
                ) : null}

                <ElectionMenu
                    activeItem={this.state.activeItem}
                    onItemClick={this.handleItemClick}
                />

                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.showLoader ? (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader>Loading</Loader>
                        </Dimmer>
                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                    </Segment>
                ) : null}

                <ElectionCards
                    elections={this.state.elections}
                    activeItem={this.state.activeItem}
                    userIsRegisteredVoter={this.state.userIsRegisteredVoter}
                />
            </React.Fragment>
        );
    }
}

export default Elections;
