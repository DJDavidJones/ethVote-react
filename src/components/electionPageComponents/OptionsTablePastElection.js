import React, { Component } from "react";
import {
    Button,
    Table,
    Form,
    Loader,
    Segment,
    Dimmer,
    Image,
    Icon,
    Header
} from "semantic-ui-react";
import ProcessingModal from "../ProcessingModal";
import paillier from "paillier-js";
import BigInt from "big-integer";

class OptionsTablePastElection extends Component {
    state = {
        modalOpen: false,
        modalState: "",
        errorMessage: "",
        electionManager: "",
        publishedResults: [],
        privateKey: "",
        privateKeyChangedOnce: false,
        inputsValid: false
    };

    async componentDidMount() {
        this.setState({
            publishedResults: await this.props.contract.methods
                .getResults()
                .call(),
            electionManager: await this.props.contract.methods
                .electionManager()
                .call()
        });
    }

    handleChange = (e, { name, value }) => {
        switch (name) {
            case "privateKey":
                this.setState({ privateKeyChangedOnce: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {
            // callback because state isn't updated immediately
            if (this.state.privateKey) {
                this.setState({ inputsValid: true });
            } else {
                this.setState({ inputsValid: false });
            }
        });
    };

    handleSubmit = async event => {
        event.preventDefault();
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
                    processingMessage="This usually takes around 60 seconds. Please stay with us."
                    errorMessage="We encountered an error. Please try again."
                    successMessage="The results have been decrypted and published."
                />

                {this.state.electionManager === this.props.userAddresses[0] &&
                this.state.publishedResults.length === 0 ? (
                    <Form onSubmit={this.handleSubmit} warning>
                        <Header as="h4" attached="top">
                            Decrypt and Publish
                        </Header>
                        <Segment attached>
                            <Form.TextArea
                                label="Private key"
                                name="privateKey"
                                value={this.state.privateKey}
                                onChange={this.handleChange}
                                error={
                                    !this.state.privateKey &&
                                    this.state.privateKeyChangedOnce
                                }
                                style={{ minHeight: 100 }}
                            />
                            <Button
                                type="submit"
                                fluid
                                loading={this.state.modalState === "processing"}
                                color="green"
                                disabled={!this.state.inputsValid}
                            >
                                Decrypt and Publish
                            </Button>
                        </Segment>
                    </Form>
                ) : null}

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell textAlign="center">
                                Result
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.props.options !== undefined ? (
                            this.props.options.map((option, i) => (
                                <Table.Row key={i}>
                                    <Table.Cell>{option.title}</Table.Cell>
                                    <Table.Cell>
                                        {option.description}
                                    </Table.Cell>
                                    <Table.Cell textAlign="center">
                                        {this.state.publishedResults.length !==
                                        0 ? (
                                            this.state.publishedResults[i]
                                        ) : (
                                            <React.Fragment>
                                                <Icon name="lock" />
                                            </React.Fragment>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan="3" textAlign="center">
                                    <Segment>
                                        <Dimmer active inverted>
                                            <Loader inverted>Loading</Loader>
                                        </Dimmer>
                                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                                    </Segment>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }
}

export default OptionsTablePastElection;
