import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Web3 from "web3";
import addresses from "../ethereum/addresses";
import RegistrationAuthorityContract from "../ethereum/RegistrationAuthority.json";
import { Segment, Dimmer, Loader, Image, Table } from "semantic-ui-react";

class RegistrationAuthority extends Component {
    state = {
        redirect: false,
        showLoader: true,
        userIsRegAuthority: false,
        wrongNetwork: false,
        voters: []
    };

    async componentDidMount() {
        await this.loadAllRelevantData();
    }

    async loadAllRelevantData() {
        let web3, regAuthority;
        try {
            // Get Web3 and contracts
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            regAuthority = this.getRegistrationAuthority(web3);

            window.web3.currentProvider.on(
                "accountsChanged",
                this.metamaskChanged
            );

            window.web3.currentProvider.autoRefreshOnNetworkChange = false;
            window.web3.currentProvider.on(
                "networkChanged",
                this.metamaskChanged
            );

            const userAddresses = await web3.eth.getAccounts();

            // Check if user is registration authority
            const regAuthorityManager = await regAuthority.methods
                .manager()
                .call();
            const userIsRegAuthority = regAuthorityManager === userAddresses[0];

            // Get a list of all registered voters
            const voters = await regAuthority.methods.getListOfVoters().call();
            let voterDetails = [];

            // forEach doesn't await all instructions
            // See: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
            await Promise.all(
                voters.map(async e => {
                    voterDetails.push(
                        await regAuthority.methods.getVoterDetails(e).call()
                    );
                })
            );

            this.setState(function(prevState, props) {
                return {
                    showLoader: false,
                    web3,
                    regAuthority,
                    userIsRegAuthority,
                    voters: voterDetails
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
        const abi = JSON.parse(RegistrationAuthorityContract.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    metamaskChanged = () => {
        window.location.reload();
    };

    render() {
        return (
            <React.Fragment>
                <h1>Registration Authority</h1>

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
                ) : (
                    <Table celled compact unstackable>
                        <Table.Header fullWidth>
                            <Table.Row>
                                <Table.HeaderCell>ID Number</Table.HeaderCell>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Address</Table.HeaderCell>
                                <Table.HeaderCell>Birthdate</Table.HeaderCell>
                                <Table.HeaderCell>
                                    Ethereum Address
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.voters.length !== 0 ? (
                                this.state.voters.map((voter, i) => (
                                    <Table.Row key={i}>
                                        <Table.Cell>
                                            {voter.personId}
                                        </Table.Cell>
                                        <Table.Cell>{voter.name}</Table.Cell>
                                        <Table.Cell>
                                            {voter.streetAddress}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {voter.birthdate}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {voter.ethAddress}
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            ) : (
                                <Table.Row>
                                    <Table.Cell colSpan="5" textAlign="center">
                                        <Segment>
                                            <Dimmer active inverted>
                                                <Loader inverted>
                                                    Loading
                                                </Loader>
                                            </Dimmer>
                                            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                                        </Segment>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                )}
            </React.Fragment>
        );
    }
}

export default RegistrationAuthority;
