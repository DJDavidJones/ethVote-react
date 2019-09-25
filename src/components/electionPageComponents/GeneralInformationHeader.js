import React, { Component } from "react";
import { Header } from "semantic-ui-react";
import getContractStatus from "../../utils/getContractStatus";
import formatTimestamp from "../../utils/formatTimestamp";

class GeneralInformationHeader extends Component {
    render() {
        return (
            <Header as="h2" textAlign="center">
                {this.props.title}
                <Header.Subheader>{this.props.description}</Header.Subheader>
                <Header.Subheader>
                    {getContractStatus(
                        this.props.startTime,
                        this.props.timeLimit
                    ) === "past" ? (
                        <React.Fragment>
                            from{" "}
                            <strong>
                                {formatTimestamp(this.props.startTime)}
                            </strong>{" "}
                            to{" "}
                            <strong>
                                {formatTimestamp(this.props.timeLimit)}
                            </strong>
                        </React.Fragment>
                    ) : getContractStatus(
                          this.props.startTime,
                          this.props.timeLimit
                      ) === "current" ? (
                        <React.Fragment>
                            ending{" "}
                            <strong>
                                {formatTimestamp(this.props.timeLimit)}
                            </strong>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            starting{" "}
                            <strong>
                                {formatTimestamp(this.props.startTime)}
                            </strong>{" "}
                            , lasting until{" "}
                            <strong>
                                {formatTimestamp(this.props.timeLimit)}
                            </strong>
                        </React.Fragment>
                    )}
                </Header.Subheader>
            </Header>
        );
    }
}

export default GeneralInformationHeader;
