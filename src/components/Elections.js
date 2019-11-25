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
import addresses from "../ethereum/addresses";
import ManagerInfoMessage from "./ManagerInfoMessage.js";
import RegAuthInfoMessage from "./RegAuthInfoMessage.js";

class Elections extends Component {
    state = {
        redirect: false,
        showLoader: true,
        userIsRegisteredVoter: false,
        userIsManager: false,
        userIsRegAuthority: false,
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
                .isVoter(userAddresses[0])
                .call();

            // Check if user is election factory manager
            const manager = await electionFactory.methods
                .factoryManager()
                .call();
            const userIsManager = manager === userAddresses[0];

            // Check if user is registration authority
            const regAuthorityManager = await regAuthority.methods
                .manager()
                .call();
            const userIsRegAuthority = regAuthorityManager === userAddresses[0];

            this.setState(function(prevState, props) {
                return {
                    showLoader: false,
                    web3,
                    regAuthority,
                    electionFactory,
                    userIsRegisteredVoter: registered,
                    userIsManager,
                    userIsRegAuthority
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
        const address = addresses.registrationAuthority;
        const abi = JSON.parse(RegistrationAuthority.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    getElectionFactory(web3) {
        const address = addresses.electionFactory;
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
                {this.state.userIsManager && this.state.showLoader === false ? (
                    <ManagerInfoMessage />
                ) : null}

                {this.state.userIsRegAuthority &&
                this.state.showLoader === false ? (
                    <RegAuthInfoMessage />
                ) : null}

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
