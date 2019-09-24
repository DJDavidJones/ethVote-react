import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Header, Segment, Message } from "semantic-ui-react";
import OptionsTableActiveElection from "./electionPageComponents/OptionsTableActiveElection";
import NotRegisteredWarning from "./NotRegisteredWarning";
import Web3 from "web3";
import RegistrationAuthority from "../ethereum/RegistrationAuthority.json";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import Election from "../ethereum/Election.json";
import addresses from "../ethereum/addresses";

class ViewElection extends Component {
    state = {
        redirect: false,
        wrongNetwork: false,
        electionNotFound: false,
        showLoader: true,
        userIsRegisteredVoter: false,
        type: "current",
        contract: undefined,
        contractDetails: {}
    };

    async componentDidMount() {
        await this.loadAllRelevantData();
        console.log(this.state);
    }

    async loadAllRelevantData() {
        let web3, regAuthority, electionFactory, contract;
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

            contract = this.getElectionContract(
                web3,
                this.props.match.params.address
            );

            const userAddresses = await web3.eth.getAccounts();

            const contractDetails = {
                address: await contract._address,
                title: await contract.methods.title().call(),
                description: await contract.methods.description().call(),
                startTime: await contract.methods.startTime().call(),
                timeLimit: await contract.methods.timeLimit().call(),
                userHasVoted: await contract.methods
                    .hasVoted(userAddresses[0])
                    .call(),
                options: await contract.methods.getOptions().call()
            };

            // Check if user is a regsitered voter
            const registered = await regAuthority.methods
                .voters(userAddresses[0])
                .call();

            this.setState({
                contract,
                contractDetails,
                userIsRegisteredVoter: registered,
                userAddresses
            });
        } catch (err) {
            if (window.web3 === undefined) {
                // Metamask not installed
                this.setState(function(prevState, props) {
                    return { redirect: true };
                });
            } else if (contract === undefined) {
                this.setState(function(prevState, props) {
                    return { electionNotFound: true };
                });
            } else {
                // Wrong Ethereum network
                this.setState(function(prevState, props) {
                    return { wrongNetwork: false };
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

    metamaskChanged = () => {
        window.location.reload();
    };

    getContractStatus(startTime, timeLimit) {
        const currentTime = Math.round(Date.now() / 1000);
        try {
            if (startTime > currentTime) {
                return "upcoming";
            } else if (startTime < currentTime && timeLimit > currentTime) {
                return "current";
            } else {
                return "past";
            }
        } catch {
            return "error";
        }
    }

    render() {
        const contractStatus = this.getContractStatus(
            this.state.contractDetails.startTime,
            this.state.contractDetails.timeLimit
        );
        return (
            <React.Fragment>
                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.wrongNetwork ? (
                    <Redirect to="/wrongnetwork" />
                ) : null}

                {this.state.electionNotFound ? <Redirect to="/error" /> : null}

                <Segment clearing>
                    <Header as="h2" floated="left">
                        {this.state.contractDetails.title}
                        <Header.Subheader>
                            {this.state.contractDetails.description}
                        </Header.Subheader>
                    </Header>
                    <Header as="h2" floated="right" textAlign="right">
                        {contractStatus !== "error" ? (
                            contractStatus === "past" ? (
                                <React.Fragment>
                                    <Header.Subheader>
                                        lasted until
                                    </Header.Subheader>
                                    {this.state.contractDetails.timeLimit}
                                </React.Fragment>
                            ) : contractStatus === "current" ? (
                                <React.Fragment>
                                    <Header.Subheader>
                                        lasts until
                                    </Header.Subheader>
                                    {this.state.contractDetails.timeLimit}
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Header.Subheader>starts</Header.Subheader>
                                    {this.state.contractDetails.startTime}
                                </React.Fragment>
                            )
                        ) : null}
                    </Header>
                </Segment>

                {this.state.contractDetails.userHasVoted ? (
                    <Message info>
                        You have already voted. You can simply vote again, which
                        will override your previous vote.
                    </Message>
                ) : null}

                {contractStatus !== "error" ? (
                    contractStatus === "past" ? (
                        "past"
                    ) : contractStatus === "current" ? (
                        <React.Fragment>
                            {!this.state.userIsRegisteredVoter ? (
                                <NotRegisteredWarning />
                            ) : null}
                            <OptionsTableActiveElection
                                options={this.state.contractDetails.options}
                                contract={this.state.contract}
                                userIsRegisteredVoter={
                                    this.state.userIsRegisteredVoter
                                }
                                userAddresses={this.state.userAddresses}
                            />
                        </React.Fragment>
                    ) : (
                        "upcoming"
                    )
                ) : null}
            </React.Fragment>
        );
    }
}

export default ViewElection;
