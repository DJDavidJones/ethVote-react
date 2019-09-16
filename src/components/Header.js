import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Menu, Icon, Dropdown } from "semantic-ui-react";

class Header extends Component {
    render() {
        return (
            <Menu icon>
                <Menu.Item header as={Link} to="/">
                    ethVote
                </Menu.Item>
                <Menu.Menu position="right">
                    <Dropdown item text="Help">
                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/metamask">
                                Metamask
                            </Dropdown.Item>
                            <Dropdown.Item as={Link} to="/register">
                                Register to vote
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Menu.Item as={Link} to="/about" position="right">
                        About
                    </Menu.Item>
                    <Menu.Item
                        href="//github.com/johannesmols/ethVote"
                        target="_blank"
                    >
                        <Icon name="github" />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
        );
    }
}

export default Header;
