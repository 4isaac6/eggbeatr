/**
 * FILENAME:    SetAnchor.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 31th, 2018
 *
 * This file contains the SetAnchor class, a specialization class
 *  of the Anchor React class, used to add Header ID attributes
 *  of the Set DOM objects in the application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class SetAnchor extends React.Component {
    constructor(props) {
        super(props);

        this.node = null;
        this.state = null;
    }

    componentWillMount() {
        this.setState(this.props);
    }

    componentDidMount() {
        this.props.callback(this);
        this.node = ReactDOM.findDOMNode(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    render() {
        return (
            <a className={ this.state.styleClass } href={ this.state.hyperlink } onClick={ this.state.handleClick.bind(this) }>
                { this.state.data }
            </a>
        );
    }
}

SetAnchor.propTypes = {
    callback: PropTypes.func.isRequired,
    data: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    handleClick: PropTypes.func.isRequired,
    hyperlink: PropTypes.string.isRequired,
    styleClass: PropTypes.string.isRequired
}

export default SetAnchor;