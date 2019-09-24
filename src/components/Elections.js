import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import Election from "../ethereum/Election.json";
import ElectionMenu from "./electionComponents/ElectionMenu";
import ElectionCards from "./electionComponents/ElectionCards";
import NotRegisteredWarning from "./NotRegisteredWarning";

class Elections extends Component {
    state = {
        redirect: false,
        showLoader: true,
        userIsRegisteredVoter: false,
        wrongNetwork: false,
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

            window.web3.currentProvider.on(
                "accountsChanged",
                this.metamaskChanged
            );

            window.web3.currentProvider.autoRefreshOnNetworkChange = false;
            window.web3.currentProvider.on(
                "networkChanged",
                this.metamaskChanged
            );

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
            if (window.web3 === undefined) {
                // Metamask not installed
                this.setState(function(prevState, props) {
                    return { redirect: true };
                });
            } else {
                // Wrong Ethereum network
                this.setState(function(prevState, props) {
                    return { wrongNetwork: true };
                });
            }
        }
    }

    getRegistrationAuthority(web3) {
        const address = "0x7CA8bDF1721b332fE1F40260c782f605b37B8BbF";
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionFactory(web3) {
        const address = "0x1115b7f57b899651D270470031AC6D6cDEc62364";
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

    metamaskChanged = () => {
        window.location.reload();
    };

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

                {this.state.wrongNetwork ? (
                    <Redirect to="/wrongnetwork" />
                ) : null}

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
