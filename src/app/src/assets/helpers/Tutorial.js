/**
 * FILENAME:    Tutorial.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 28th, 2018
 *
 * This file contains the Tutorial class, a helper class for the
 *  tutorial descriptions of the application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Anchor from 'utils/Anchor';
import FnScroll from 'functions/FnScroll';


class Tutorial extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    componentDidMount() {
        this.props.callback(this);
    }

    handleClick() {
        var nextLocation = document.getElementById(this.props.nextName);

        FnScroll.tutorialScroll(ReactDOM.findDOMNode(this), nextLocation);
    }

    render() {
        return (
            <div className={ this.state.wrapperClass }>
                <h2 className={ this.state.headingClass }>
                    Step #{ this.state.step }:
                </h2>
                <p>
                    { this.state.data }
                </p>
                { this.state.buttonClass ? React.createElement(Anchor, {
                    "data": "\u2192",
                    "handleClick": this.handleClick.bind(this),
                    "styleClass": this.state.buttonClass
                }) : null }
            </div>
        );
    }
}

Tutorial.defaultProps = {
    callback: () => null
}

Tutorial.propTypes = {
    buttonClass: PropTypes.string.isRequired,
    callback: PropTypes.func,
    data: PropTypes.string.isRequired,
    headingClass: PropTypes.string.isRequired,
    nextName: PropTypes.string.isRequired,
    step: PropTypes.number.isRequired,
    wrapperClass: PropTypes.string.isRequired
}

export default Tutorial;
