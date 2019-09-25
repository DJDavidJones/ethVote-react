import React, { Component } from "react";
import { Modal, Icon, Button, Accordion } from "semantic-ui-react";

class ProcessingTransactionModal extends Component {
    state = {
        showingErrorMessage: false
    };

    handleErrorAccordion = () => {
        this.setState(function(prevState, props) {
            return { showingErrorMessage: !prevState.showingErrorMessage };
        });
    };

    render() {
        return (
            <Modal
                open={this.props.processingVote || this.props.confirmationOpen}
                closeOnDimmerClick={!this.props.processingVote}
                closeOnDocumentClick={!this.props.processingVote}
                closeOnEscape={!this.props.processingVote}
                onClose={this.props.handleConfirmationClose}
                size="small"
                dimmer="blurring"
            >
                <Modal.Header>
                    {this.props.processingVote ? (
                        <React.Fragment>
                            <Icon loading name="spinner" /> Processing your vote
                        </React.Fragment>
                    ) : this.props.errorMessage ? (
                        <React.Fragment>
                            <Icon name="warning sign" /> Error
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Icon name="check" /> Success
                        </React.Fragment>
                    )}
                </Modal.Header>
                <Modal.Content>
                    {this.props.processingVote ? (
                        "This usually takes around 15 seconds. Please stay with us."
                    ) : this.props.errorMessage ? (
                        <Accordion>
                            <Accordion.Title
                                active={this.state.showingErrorMessage}
                                onClick={this.handleErrorAccordion}
                            >
                                <Icon name="dropdown" />
                                We encountered an error. Please try again.
                            </Accordion.Title>
                            <Accordion.Content
                                active={this.state.showingErrorMessage}
                            >
                                <p>{this.props.errorMessage}</p>
                            </Accordion.Content>
                        </Accordion>
                    ) : (
                        "Thank you, your vote has been counted."
                    )}
                </Modal.Content>

                {this.props.processingVote ? null : (
                    <Modal.Actions>
                        <Button
                            color="green"
                            onClick={this.props.handleConfirmationClose}
                        >
                            Got it
                        </Button>
                    </Modal.Actions>
                )}
            </Modal>
        );
    }
}

export default ProcessingTransactionModal;
