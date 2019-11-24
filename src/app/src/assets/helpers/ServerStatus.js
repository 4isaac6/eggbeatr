/**
 * FILENAME:    ServerStatus.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 31th, 2018
 *
 * This file contains the ServerStatus class, a helper class to
 *  display the connection status to the eggbeatr server.
 */

import React from 'react';
import PropTypes from 'prop-types';


class ServerStatus extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "status": this.props.status
        };
    }

    componentDidMount() {
        this.props.callback(this);
    }

    getStyleClass() {
        var style = "circle ";

        if (this.state.status) {
            style += "success-cell";
        } else {
            style += "error-cell";
        }

        return style;
    }

    render() {
        return (
            <div className="server-status">
                <div className={ this.getStyleClass() }></div>
            </div>
        );
    }
}

ServerStatus.defaultProps = {
    callback: () => null
}

ServerStatus.propTypes = {
    callback: PropTypes.func,
    status: PropTypes.bool.isRequired
}

export default ServerStatus;
