import React from "react";
import { Link } from "react-router-dom";
import { Message, Button } from "semantic-ui-react";

export default function RegAuthInfoMessage() {
    return (
        <Message info>
            <Button basic floated="right" as={Link} to="/registrationauthority">
                Overview
            </Button>
            <Message.Header>You are the Registration Authority.</Message.Header>
            <p>
                You can manage and see registered voters by clicking on the
                button to the right.
            </p>
        </Message>
    );
}
