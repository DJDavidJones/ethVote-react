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
        statusMessage:
            "This usually takes around 60 seconds. Please stay with us.",
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

        this.setState({ modalOpen: true, modalState: "processing" });

        try {
            // Create private and public key
            const privateKeyCredentials = JSON.parse(this.state.privateKey);
            const privateKey = new paillier.PrivateKey(
                BigInt(privateKeyCredentials.lambda),
                BigInt(privateKeyCredentials.mu),
                BigInt(privateKeyCredentials._p),
                BigInt(privateKeyCredentials._q),
                privateKeyCredentials.publicKey
            );
            const publicKey = new paillier.PublicKey(
                BigInt(privateKeyCredentials.publicKey.n),
                BigInt(privateKeyCredentials.publicKey.g)
            );

            // Get the list of addresses that voted
            const voters = await this.props.contract.methods
                .getListOfAddressesThatVoted()
                .call();

            if (voters.length === 0) {
                throw new Error("No votes found.");
            }

            // Get vote of each voter
            let encryptedVotes = [];
            for (let i = 0; i < voters.length; i++) {
                this.setState({
                    statusMessage:
                        "Retrieving encrypted vote " +
                        (i + 1) +
                        " of " +
                        voters.length
                });

                encryptedVotes.push(
                    await this.props.contract.methods
                        .getEncryptedVoteOfVoter(voters[i])
                        .call()
                );
            }

            // Organize encrypted votes in arrays
            let votesForEachOption = [];
            for (let i = 0; i < encryptedVotes.length; i++) {
                votesForEachOption.push(JSON.parse(encryptedVotes[i]));
            }

            // Tallying encrypted votes
            let tallyForEachOption = new Array(this.props.options.length);

            for (let i = 0; i < votesForEachOption.length; i++) {
                this.setState({
                    statusMessage:
                        "Tallying encrypted vote " +
                        (i + 1) +
                        " of " +
                        votesForEachOption.length
                });

                for (let j = 0; j < this.props.options.length; j++) {
                    if (i === 0) {
                        tallyForEachOption[j] = BigInt(
                            votesForEachOption[i][j]
                        );
                    } else {
                        tallyForEachOption[j] = publicKey.addition(
                            tallyForEachOption[j],
                            votesForEachOption[i][j]
                        );
                    }
                }
            }

            // Decrypt tallies
            let decryptedResultForEachOption = new Array(
                this.props.options.length
            );

            for (let i = 0; i < tallyForEachOption.length; i++) {
                this.setState({
                    statusMessage:
                        "Decrypting vote " +
                        (i + 1) +
                        " of " +
                        tallyForEachOption.length
                });

                decryptedResultForEachOption[i] = privateKey.decrypt(
                    tallyForEachOption[i]
                );
            }

            // Verifying number of votes matches voters
            const sumOfVotes = decryptedResultForEachOption.reduce(
                (a, b) => a + b,
                0
            );

            if (sumOfVotes !== voters.length) {
                throw new Error(
                    "Number of tallied votes is not the same as the number of voters."
                );
            }

            // Convert to regular string array
            let result = new Array(this.props.options.length);
            for (let i = 0; i < decryptedResultForEachOption.length; i++) {
                result[i] = decryptedResultForEachOption[i].toString();
            }

            // Publish results
            this.setState({
                statusMessage: "Publishing result"
            });

            await this.props.contract.methods
                .publishResults(result)
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
                    processingMessage={this.state.statusMessage}
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
                                animated="fade"
                                type="submit"
                                fluid
                                loading={this.state.modalState === "processing"}
                                color="green"
                                disabled={!this.state.inputsValid}
                            >
                                <Button.Content visible>
                                    Decrypt and Publish
                                </Button.Content>
                                <Button.Content hidden>
                                    <Icon name="lock open" />
                                </Button.Content>
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
