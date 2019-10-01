import React, { Component } from "react";
import {
    Table,
    Segment,
    Dimmer,
    Loader,
    Image,
    Form,
    Button,
    Icon,
    Header
} from "semantic-ui-react";
import ProcessingModal from "../ProcessingModal";

class OptionsTableUpcomingElection extends Component {
    state = {
        modalOpen: false,
        modalState: "",
        errorMessage: "",
        electionManager: "",
        title: "",
        titleChangedOnce: false,
        description: "",
        descriptionChangedOnce: false,
        inputsValid: false
    };

    async componentDidMount() {
        this.setState({
            electionManager: await this.props.contract.methods
                .electionManager()
                .call()
        });
    }

    handleChange = (e, { name, value }) => {
        switch (name) {
            case "title":
                this.setState({ titleChangedOnce: true });
                break;
            case "description":
                this.setState({ descriptionChangedOnce: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {
            if (this.state.title && this.state.description) {
                this.setState({ inputsValid: true });
            } else {
                this.setState({ inputsValid: false });
            }
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        this.setState({ modalOpen: true, modalState: "processing" });

        try {
            await this.props.contract.methods
                .addOption(this.state.title, this.state.description)
                .send({ from: this.props.userAddresses[0] });

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
                    successMessage="The option has been added. Thank you."
                />

                {this.state.electionManager === this.props.userAddresses[0] ? (
                    <Form onSubmit={this.handleSubmit} warning>
                        <Header as="h4" attached="top">
                            Add Option
                        </Header>
                        <Segment attached>
                            <Form.Group widths="equal">
                                <Form.Input
                                    width="7"
                                    fluid
                                    placeholder="Title"
                                    name="title"
                                    value={this.state.title}
                                    onChange={this.handleChange}
                                    error={
                                        !this.state.title &&
                                        this.state.titleChangedOnce
                                    }
                                />
                                <Form.Input
                                    width="7"
                                    fluid
                                    name="description"
                                    placeholder="Description"
                                    value={this.state.description}
                                    onChange={this.handleChange}
                                    error={
                                        !this.state.description &&
                                        this.state.descriptionChangedOnce
                                    }
                                />
                                <Form.Button
                                    width="2"
                                    fluid
                                    type="submit"
                                    animated="fade"
                                    loading={
                                        this.state.modalState === "processing"
                                    }
                                    color="green"
                                    disabled={!this.state.inputsValid}
                                >
                                    <Button.Content visible>Add</Button.Content>
                                    <Button.Content hidden>
                                        <Icon name="user plus" />
                                    </Button.Content>
                                </Form.Button>
                            </Form.Group>
                        </Segment>
                    </Form>
                ) : null}

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
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

export default OptionsTableUpcomingElection;
