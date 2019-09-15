import React from "react";
import { Menu } from "semantic-ui-react";

export default function ElectionMenu(props) {
    return (
        <Menu pointing secondary compact widths={"3"}>
            <Menu.Item
                name="past"
                active={props.activeItem === "past"}
                onClick={props.onItemClick}
            />
            <Menu.Item
                name="current"
                active={props.activeItem === "current"}
                onClick={props.onItemClick}
            />
            <Menu.Item
                name="upcoming"
                active={props.activeItem === "upcoming"}
                onClick={props.onItemClick}
            />
        </Menu>
    );
}
