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

class OptionsTableActiveElection extends Component {
    state = {
        selected: [],
        voteLimit: 1,
        modalOpen: false,
        modalState: "",
        errorMessage: ""
    };

    toggle = e => {
        const selected = [...this.state.selected];
        if (e.target.checked) {
            selected.push(e.target.id);
        } else {
            const index = selected.findIndex(v => v === e.target.id);
            selected.splice(index, 1);
        }
        this.setState({ selected });
    };

    vote = async event => {
        this.setState({ modalOpen: true, modalState: "processing" });

        try {
            await this.props.contract.methods
                .vote(this.encryptVotes())
                .send({ from: this.props.userAddresses[0], gas: "10000000" });

            this.setState({ modalState: "success" });
        } catch (err) {
            this.setState({ modalState: "error", errorMessage: err.message });
        }
    };

    encryptVotes() {
        const publicKeyCredentials = JSON.parse(this.props.publicKey);
        const publicKey = new paillier.PublicKey(
            BigInt(publicKeyCredentials.n),
            BigInt(publicKeyCredentials.g)
        );

        let votes = Array(this.props.options.length);
        for (let i = 0; i < votes.length; i++) {
            votes[i] = publicKey.encrypt(0).toString();
        }

        this.state.selected.forEach(option => {
            votes[option] = publicKey.encrypt(1).toString();
        });

        return JSON.stringify(votes);
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
                    processingMessage="This usually takes around 15 seconds. Please stay with us."
                    errorMessage="We encountered an error. Please try again."
                    successMessage="Your vote has been counted. Thank you."
                />

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            {this.props.userIsRegisteredVoter ? (
                                <Table.HeaderCell textAlign="center">
                                    Vote
                                </Table.HeaderCell>
                            ) : null}
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
                                    {this.props.userIsRegisteredVoter ? (
                                        <Table.Cell
                                            collapsing
                                            textAlign="center"
                                        >
                                            <Checkbox
                                                toggle
                                                id={i}
                                                onChange={this.toggle}
                                            />
                                        </Table.Cell>
                                    ) : null}
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

                    {this.props.userIsRegisteredVoter ? (
                        <Table.Footer fullWidth>
                            <Table.Row>
                                <Table.HeaderCell colSpan="2">
                                    {this.state.selected.length === 0 ? (
                                        <Message warning>
                                            Please select at least one option.
                                        </Message>
                                    ) : this.state.selected.length >
                                      this.state.voteLimit ? (
                                        <Message negative>
                                            You only have {this.state.voteLimit}{" "}
                                            {this.state.voteLimit > 1
                                                ? "votes"
                                                : "vote"}
                                            , but selected{" "}
                                            {this.state.selected.length}{" "}
                                            options.
                                        </Message>
                                    ) : null}
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    <Button
                                        animated="fade"
                                        loading={
                                            this.state.modalState ===
                                            "processing"
                                        }
                                        onClick={this.vote}
                                        color="green"
                                        fluid
                                        disabled={
                                            !(
                                                this.state.selected.length >
                                                    0 &&
                                                this.state.selected.length <=
                                                    this.state.voteLimit
                                            ) ||
                                            !this.props.userIsRegisteredVoter
                                        }
                                    >
                                        <Button.Content visible>
                                            Vote
                                        </Button.Content>
                                        <Button.Content hidden>
                                            <Icon name="envelope" />
                                        </Button.Content>
                                    </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    ) : null}
                </Table>
            </React.Fragment>
        );
    }
}

export default OptionsTableActiveElection;
