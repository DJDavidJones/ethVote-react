import React, { Component } from "react";
import {
    Button,
    Table,
    Checkbox,
    Loader,
    Segment,
    Dimmer,
    Image,
    Message
} from "semantic-ui-react";

class OptionsTableActiveElection extends Component {
    state = {
        selected: [],
        voteLimit: 1
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

    render() {
        return (
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
                                <Table.Cell>{option.description}</Table.Cell>
                                {this.props.userIsRegisteredVoter ? (
                                    <Table.Cell collapsing textAlign="center">
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
                                        {this.state.selected.length} options.
                                    </Message>
                                ) : null}
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <Button
                                    color="green"
                                    disabled={
                                        !(
                                            this.state.selected.length > 0 &&
                                            this.state.selected.length <=
                                                this.state.voteLimit
                                        ) || !this.props.userIsRegisteredVoter
                                    }
                                >
                                    Vote
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                ) : null}
            </Table>
        );
    }
}

export default OptionsTableActiveElection;
