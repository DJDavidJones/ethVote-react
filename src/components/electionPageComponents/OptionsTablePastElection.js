import React, { Component } from "react";
import {
    Button,
    Table,
    Checkbox,
    Loader,
    Segment,
    Dimmer,
    Image,
    Message,
    Icon
} from "semantic-ui-react";
import ProcessingModal from "../ProcessingModal";
import paillier from "paillier-js";
import BigInt from "big-integer";

class OptionsTablePastElection extends Component {
    state = {
        modalOpen: false,
        modalState: "",
        errorMessage: "",
        publishedResults: []
    };

    async componentDidMount() {
        this.setState({
            publishedResults: await this.props.contract.methods
                .getResults()
                .call()
        });
    }

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
