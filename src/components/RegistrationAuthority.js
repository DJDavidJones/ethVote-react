import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Web3 from "web3";
import addresses from "../ethereum/addresses";
import RegistrationAuthorityContract from "../ethereum/RegistrationAuthority.json";
import ProcessingModal from "./ProcessingModal";
import {
    Segment,
    Dimmer,
    Loader,
    Image,
    Table,
    Header,
    Button,
    Input,
    Icon
} from "semantic-ui-react";

class RegistrationAuthority extends Component {
    state = {
        redirect: false,
        showLoader: true,
        userIsRegAuthority: false,
        wrongNetwork: false,
        voters: [],
        modalOpen: false,
        modalState: "",
        errorMessage: "",
        idNumber: "",
        name: "",
        address: "",
        birthdate: "",
        ethAddress: "",
        ethAddressChangedOnce: false,
        inputsValid: false,
        successMessage: ""
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
                    voters: voterDetails,
                    userAddresses
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

    handleChange = (e, { name, value }) => {
        if (name === "ethAddress") {
            this.setState({ ethAddressChangedOnce: true });
        }

        this.setState({ [name]: value }, function() {
            if (this.state.ethAddress) {
                this.setState({ inputsValid: true });
            } else {
                this.setState({ inputsValid: false });
            }
        });
    };

    handleRemoveClick = async i => {
        this.setState({ successMessage: "The user has been deregistered.", modalOpen: true, modalState: "processing" });

        try {
            const address = this.state.voters[i].ethAddress;
            await this.state.regAuthority.methods
                .unregisterVoter(address)
                .send({ from: this.state.userAddresses[0] });

            this.setState({ modalState: "success" });
        } catch (err) {
            this.setState({ modalState: "error", errorMessage: err.message });
        }
    };

    handleRegisterVoter = async e => {
        this.setState({ successMessage: "The user has been registered.", modalOpen: true, modalState: "processing" });

        try {
            await this.state.regAuthority.methods
                .registerOrUpdateVoter(
                    this.state.ethAddress,
                    this.state.name,
                    this.state.address,
                    this.state.birthdate,
                    this.state.idNumber
                )
                .send({ from: this.state.userAddresses[0] });

            this.setState({ modalState: "success" });
        } catch (err) {
            this.setState({ modalState: "error", errorMessage: err.message });
        }
    };

    handleModalClose = () => {
        this.setState({ modalOpen: false });
    };

    render() {
        return (
            <React.Fragment>
                <ProcessingModal
                    modalOpen={this.state.modalOpen}
                    modalState={this.state.modalState}
                    handleModalClose={this.handleModalClose}
                    errorMessageDetailed={this.state.errorMessage}
                    processingMessage="This usually takes around 15 seconds. Please stay with us."
                    errorMessage="We encountered an error. Please try again."
                    successMessage={this.state.successMessage}
                />

                <Header as="h1">Registration Overview</Header>

                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.wrongNetwork ? (
                    <Redirect to="/wrongnetwork" />
                ) : null}

                {!this.state.showLoader && !this.state.userIsRegAuthority ? (
                    <Redirect to="/" />
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
                                <Table.HeaderCell textAlign="center">
                                    Control
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="ID Number"
                                        name="idNumber"
                                        value={this.state.idNumber}
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Name"
                                        name="name"
                                        value={this.state.name}
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Address"
                                        name="address"
                                        value={this.state.address}
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Birthdate"
                                        name="birthdate"
                                        value={this.state.birthdate}
                                        onChange={this.handleChange}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Ethereum Address"
                                        name="ethAddress"
                                        value={this.state.ethAddress}
                                        onChange={this.handleChange}
                                        error={
                                            !this.state.inputsValid &&
                                            this.state.ethAddressChangedOnce
                                        }
                                    />
                                </Table.Cell>
                                <Table.Cell textAlign="center">
                                    <Button
                                        fluid
                                        positive
                                        animated="fade"
                                        disabled={!this.state.inputsValid}
                                        onClick={this.handleRegisterVoter}
                                    >
                                        <Button.Content visible>
                                            Register
                                        </Button.Content>
                                        <Button.Content hidden>
                                            <Icon name="add user" />
                                        </Button.Content>
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
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
                                        <Table.Cell textAlign="center">
                                            <Button
                                                fluid
                                                negative
                                                animated="fade"
                                                onClick={() =>
                                                    this.handleRemoveClick(i)
                                                }
                                            >
                                                <Button.Content visible>
                                                    Deregister
                                                </Button.Content>
                                                <Button.Content hidden>
                                                    <Icon name="remove user" />
                                                </Button.Content>
                                            </Button>
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
