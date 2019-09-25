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
import ProcessingVoteModal from "./ProcessingVoteModal";

class OptionsTableActiveElection extends Component {
    state = {
        selected: [],
        voteLimit: 1,
        processingVote: false,
        confirmationOpen: false,
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
        this.setState({ processingVote: true });

        let errorMessage = "";
        try {
            await this.props.contract.methods
                .vote(this.encryptVotes())
                .send({ from: this.props.userAddresses[0] });
        } catch (err) {
            errorMessage = err.message;
        }

        this.setState({
            processingVote: false,
            confirmationOpen: true,
            errorMessage
        });
    };

    encryptVotes() {
        let votes = Array(this.props.options.length).fill(0); // TODO: replace with encrypted zero
        this.state.selected.forEach(option => {
            votes[option] = 1; // TODO: replace with encrypted one
        });
        return votes;
    }

    handleConfirmationClose = () => {
        this.setState({ confirmationOpen: false });
    };

    render() {
        return (
            <React.Fragment>
                <ProcessingVoteModal
                    confirmationOpen={this.state.confirmationOpen}
                    processingVote={this.state.processingVote}
                    errorMessage={this.state.errorMessage}
                    handleConfirmationClose={this.handleConfirmationClose}
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
                                        loading={this.state.processingVote}
                                        onClick={this.vote}
                                        color="green"
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
