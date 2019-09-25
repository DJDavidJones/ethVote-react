import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Header, Form, Button } from "semantic-ui-react";
import { DateTimeInput } from "semantic-ui-calendar-react";
import ElectionFactory from "../ethereum/ElectionFactory.json";
import convertTimeStringToDate from "../utils/convertTimeStringToDate";
import addresses from "../ethereum/addresses";
import Web3 from "web3";
import networkVersion from "../ethereum/networkVersion";

class CreateNewElection extends Component {
    state = {
        electionFactory: undefined,
        userIsManager: true,
        title: "",
        description: "",
        startTime: "",
        timeLimit: "",
        processingTransaction: false,
        successful: false,
        errorMessage: ""
    };

    async componentDidMount() {
        await this.loadContract();
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
                window.web3.currentProvider.networkVersion !==
                networkVersion.version
            ) {
                this.setState(function(prevState, props) {
                    return { wrongNetwork: true };
                });
            }

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
            }
        }
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

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSubmit = async event => {
        event.preventDefault();

        this.setState({ processingTransaction: true });

        let errorMessage = "";
        try {
            await this.state.electionFactory.methods
                .createElection(
                    this.state.title,
                    this.state.description,
                    convertTimeStringToDate(this.state.startTime),
                    convertTimeStringToDate(this.state.timeLimit)
                )
                .send({ from: this.state.userAddresses[0] });
        } catch (err) {
            errorMessage = err.message;
            console.log(errorMessage);
        }

        this.setState({
            processingTransaction: false,
            successful: true,
            errorMessage
        });
    };

    render() {
        return (
            <React.Fragment>
                {this.state.redirect ? <Redirect to="/metamask" /> : null}

                {this.state.wrongNetwork ? (
                    <Redirect to="/wrongnetwork" />
                ) : null}

                {this.state.userIsManager ? null : <Redirect to="/" />}

                <Header as="h1">Create Election</Header>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Input
                        label="Title"
                        placeholder="Title"
                        name="title"
                        value={this.state.title}
                        onChange={this.handleChange}
                        fluid
                    />
                    <Form.Input
                        label="Description"
                        placeholder="Description"
                        name="description"
                        value={this.state.description}
                        onChange={this.handleChange}
                        fluid
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
                        />
                    </Form.Group>
                    <Button
                        type="submit"
                        fluid
                        loading={this.state.processingTransaction}
                    >
                        Create
                    </Button>
                </Form>
            </React.Fragment>
        );
    }
}

export default CreateNewElection;
