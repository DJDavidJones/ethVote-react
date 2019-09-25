import React, { Component } from "react";
import { Modal, Icon, Button, Accordion } from "semantic-ui-react";

class ProcessingCreateElectionModal extends Component {
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
                open={this.props.processingTransaction || this.props.successful}
                closeOnDimmerClick={!this.props.processingTransaction}
                closeOnDocumentClick={!this.props.processingTransaction}
                closeOnEscape={!this.props.processingTransaction}
                onClose={this.props.handleConfirmationClose}
                size="small"
                dimmer="blurring"
            >
                <Modal.Header>
                    {this.props.processingTransaction ? (
                        <React.Fragment>
                            <Icon loading name="spinner" /> Creating Election
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
                    {this.props.processingTransaction ? (
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
                        "The election has been created."
                    )}
                </Modal.Content>

                {this.props.processingTransaction ? null : (
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

export default ProcessingCreateElectionModal;
