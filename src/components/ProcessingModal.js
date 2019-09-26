import React, { Component } from "react";
import { Modal, Icon, Button, Accordion } from "semantic-ui-react";

class ProcessingModal extends Component {
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
                open={this.props.modalOpen}
                closeOnDimmerClick={this.props.modalState !== "processing"}
                closeOnDocumentClick={this.props.modalState !== "processing"}
                closeOnEscape={this.props.modalState !== "processing"}
                onClose={this.props.handleModalClose}
                size="small"
                dimmer="blurring"
            >
                <Modal.Header>
                    {this.props.modalState === "processing" ? (
                        <React.Fragment>
                            <Icon loading name="spinner" /> Processing
                            transaction
                        </React.Fragment>
                    ) : this.props.modalState === "error" ? (
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
                    {this.props.modalState === "processing" ? (
                        this.props.processingMessage
                    ) : this.props.modalState === "error" ? (
                        <Accordion>
                            <Accordion.Title
                                active={this.state.showingErrorMessage}
                                onClick={this.handleErrorAccordion}
                            >
                                <Icon name="dropdown" />
                                {this.props.errorMessage}
                            </Accordion.Title>
                            <Accordion.Content
                                active={this.state.showingErrorMessage}
                            >
                                <p>{this.props.errorMessageDetailed}</p>
                            </Accordion.Content>
                        </Accordion>
                    ) : (
                        this.props.successMessage
                    )}
                </Modal.Content>

                {this.props.modalState === "processing" ? null : (
                    <Modal.Actions>
                        <Button
                            color="green"
                            onClick={this.props.handleModalClose}
                        >
                            Got it
                        </Button>
                    </Modal.Actions>
                )}
            </Modal>
        );
    }
}

export default ProcessingModal;
