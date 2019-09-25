import React, { Component } from "react";
import { Modal, Icon, Button, Progress } from "semantic-ui-react";

class ProcessingTransactionModal extends Component {
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
                    {this.props.processingVote ? <p>Loading</p> : null}
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color="green"
                        onClick={this.props.handleConfirmationClose}
                    >
                        Got it
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ProcessingTransactionModal;
