/**
 * FILENAME:    WaitIndicator.js
 * AUTHOR:      Isaac Streight
 * START DATE:  July 7th, 2018
 *
 * This file contains the WaitIndicator class, a helper class for displaying
 *  wait indicators throughout the application.
 */

import React from 'react';
import PropTypes from 'prop-types';


class WaitIndicator extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    componentDidMount() {
        this.props.callback(this);
    }

    render() {
        return (
            <div className={ "wait-indicator " + this.state.indicatorStyleClass }>
                <div className={ "wait-spinner " + this.state.spinnerStyleClass }>
                    <span></span><span></span>
                </div>
                <div className={"wait-label " + this.state.labelStyleClass }>
                    { this.state.data }
                </div>
            </div>
        );
    }
}

WaitIndicator.defaultProps = {
    callback: () => null,
    indicatorStyleClass: "is-invisible",
    labelStyleClass: "",
    spinnerStyleClass: ""
}

WaitIndicator.propTypes = {
    callback: PropTypes.func,
    data: PropTypes.string.isRequired,
    indicatorStyleClass: PropTypes.string,
    labelStyleClass: PropTypes.string,
    spinnerStyleClass: PropTypes.string
}

export default WaitIndicator;
