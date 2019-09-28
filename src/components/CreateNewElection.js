import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Header, Form, Button, Segment, Icon } from "semantic-ui-react";
import { DateTimeInput } from "semantic-ui-calendar-react";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import convertTimeStringToDate from "../utils/convertTimeStringToDate";
import addresses from "../ethereum/addresses";
import Web3 from "web3";
import ProcessingModal from "./ProcessingModal";
import paillier from "paillier-js";
import FileSaver from "file-saver";

class CreateNewElection extends Component {
    state = {
        electionFactory: undefined,
        userIsManager: true,
        title: "",
        titleChangedOnce: false,
        description: "",
        descriptionChangedOnce: false,
        startTime: "",
        startTimeChangedOnce: false,
        timeLimit: "",
        timeLimitChangedOnce: false,
        inputsValid: false,
        modalOpen: false,
        modalState: "",
        errorMessage: "",
        generatedKeyPair: false,
        publicKey: {},
        privateKey: {}
    };

    async componentDidMount() {
        await this.loadContract();
        this.generateKeys();
    }

    async loadContract() {
        let web3, electionFactory;
        try {
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
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

            const userAddresses = await web3.eth.getAccounts();

            if (
                (await electionFactory.methods.factoryManager().call()) !==
                userAddresses[0]
            ) {
                this.setState({ userIsManager: false });
            }

            this.setState({
                electionFactory,
                userAddresses
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

    generateKeys() {
        const { publicKey, privateKey } = paillier.generateRandomKeys(1024);
        this.setState({
            publicKey,
            privateKey,
            generatedKeyPair: true
        });
    }

    getElectionFactory(web3) {
        const address = addresses.electionFactory;
        const abi = JSON.parse(ElectionFactory.interface);
        const contract = new web3.eth.Contract(abi, address);
        return contract;
    }

    metamaskChanged = () => {
        window.location.reload();
    };

    handleChange = (e, { name, value }) => {
        switch (name) {
            case "title":
                this.setState({ titleChangedOnce: true });
                break;
            case "description":
                this.setState({ descriptionChangedOnce: true });
                break;
            case "startTime":
                this.setState({ startTimeChangedOnce: true });
                break;
            case "timeLimit":
                this.setState({ timeLimitChangedOnce: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {
            // callback because state isn't updated immediately
            if (
                this.state.title &&
                this.state.description &&
                this.state.startTime &&
                this.state.timeLimit
            ) {
                this.setState({ inputsValid: true });
            }
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        this.setState({ modalOpen: true, modalState: "processing" });

        try {
            await this.state.electionFactory.methods
                .createElection(
                    this.state.title,
                    this.state.description,
                    convertTimeStringToDate(this.state.startTime),
                    convertTimeStringToDate(this.state.timeLimit)
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

    copyKey = () => {
        navigator.clipboard.writeText(JSON.stringify(this.state.privateKey));
    };

    saveKeyToFile = () => {
        let blob = new Blob([JSON.stringify(this.state.privateKey)], {
            type: "application/json;charset=utf-8"
        });
        FileSaver.saveAs(blob, "privatekey.json");
    };

    render() {
        return (
            <React.Fragment>
                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.wrongNetwork ? (
                    <Redirect to="/wrongnetwork" />
                ) : null}

                {this.state.userIsManager ? null : <Redirect to="/" />}

                <ProcessingModal
                    modalOpen={this.state.modalOpen}
                    modalState={this.state.modalState}
                    handleModalClose={this.handleModalClose}
                    errorMessageDetailed={this.state.errorMessage}
                    processingMessage="This usually takes around 30 seconds. Please stay with us."
                    errorMessage="We encountered an error. Please try again."
                    successMessage="The contract has been created."
                />

                <Header as="h1">Create Election</Header>

                <Form onSubmit={this.handleSubmit}>
                    <Header as="h4" attached="top">
                        General Information
                    </Header>
                    <Segment attached>
                        <Form.Input
                            label="Title"
                            placeholder="Title"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleChange}
                            fluid
                            error={
                                !this.state.title && this.state.titleChangedOnce
                            }
                        />
                        <Form.Input
                            label="Description"
                            placeholder="Description"
                            name="description"
                            value={this.state.description}
                            onChange={this.handleChange}
                            fluid
                            error={
                                !this.state.description &&
                                this.state.descriptionChangedOnce
                            }
                        />
                        <Form.Group widths={2}>
                            <DateTimeInput
                                label="Start Time"
                                name="startTime"
                                placeholder="Start Time"
                                value={this.state.startTime}
                                iconPosition="left"
                                onChange={this.handleChange}
                                dateFormat={"DD.MM.YYYY"}
                                clearable
                                closable
                                hideMobileKeyboard
                                error={
                                    !this.state.startTime &&
                                    this.state.startTimeChangedOnce
                                }
                            />
                            <DateTimeInput
                                label="Time Limit"
                                name="timeLimit"
                                placeholder="Time Limit"
                                value={this.state.timeLimit}
                                iconPosition="left"
                                onChange={this.handleChange}
                                dateFormat={"DD.MM.YYYY"}
                                clearable
                                closable
                                hideMobileKeyboard
                                error={
                                    !this.state.timeLimit &&
                                    this.state.timeLimitChangedOnce
                                }
                            />
                        </Form.Group>
                    </Segment>

                    <Header as="h4" attached="top">
                        Encryption Settings
                    </Header>
                    <Segment attached>
                        <Form.TextArea
                            label="Private and Public key"
                            value={
                                this.state.generatedKeyPair
                                    ? JSON.stringify(this.state.privateKey)
                                    : "Generating keys..."
                            }
                            readOnly
                            style={{ minHeight: 100 }}
                        />

                        <Button
                            type="button"
                            icon
                            labelPosition="left"
                            onClick={this.copyKey}
                        >
                            <Icon name="copy" />
                            Copy
                        </Button>
                        <Button
                            type="button"
                            icon
                            labelPosition="left"
                            onClick={this.saveKeyToFile}
                        >
                            <Icon name="save" />
                            Save
                        </Button>
                    </Segment>

                    <Segment vertical>
                        <Button
                            type="submit"
                            fluid
                            loading={this.state.processingTransaction}
                            color="green"
                            disabled={!this.state.inputsValid}
                        >
                            Create
                        </Button>
                    </Segment>
                </Form>
            </React.Fragment>
        );
    }
}

export default CreateNewElection;
