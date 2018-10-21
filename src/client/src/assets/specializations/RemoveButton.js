/**
 * FILENAME:    RemoveButton.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 14th, 2018
 *
 * This file contains the RemoveButton class, a specialization class for the
 *  Anchor React class, the buttons responsible for removing component items.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Anchor from 'utils/Anchor';

class RemoveButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = null;
    }

    componentWillMount() {
        this.setState(this.props);
    }

    componentDidMount() {
        this.props.callback(this);
    }

    render() {
        return (
            <Anchor
                callback={ this.state.callback.bind(this) }
                data={ "Remove" }
                handleClick={ this.state.handleClick.bind(this) }
                hyperlink={ "javascript:void(0)" }
                styleClass={ "pure-button remove" }
            />
        );
    }
}

RemoveButton.propTypes = {
    callback: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
    id: PropTypes.number
}

export default RemoveButton;
