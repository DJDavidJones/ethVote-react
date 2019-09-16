import React, { Component } from "react";

class ViewElection extends Component {
    render() {
        return (
            <React.Fragment>
                <h1>Election</h1>
                <p>{this.props.match.params.address}</p>
            </React.Fragment>
        );
    }
}

export default ViewElection;
