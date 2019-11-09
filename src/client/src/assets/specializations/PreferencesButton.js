/**
 * FILENAME:    PreferencesButton.js
 * AUTHOR:      Isaac Streight
 * START DATE:  Oct 14th, 2018
 *
 * This file contains the PreferencesButton class, a specialization class
 *  for the Anchor React class, for displaying Instructor preferences
 *  from the Instructors component of the application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Anchor from 'utils/Anchor';

class PreferencesButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = null;
    }

    componentWillMount() {
        this.setState(Object.assign({
            "styleClass": "pure-button preferences"
        }, this.props));
    }

    componentDidMount() {
        this.props.callback(this);
    }

    onClick() {
        this.state.handleClick(this.state.instructorName);
    }

    toggleState(enable) {
        var handleClick;
        var styleClass = this.state.styleClass;

        if (styleClass.includes("pure-button-disabled")) {
            styleClass = styleClass.replace(" pure-button-disabled", "");
        }

        if (enable) {
            handleClick = () => null;
            styleClass =  styleClass.concat(" pure-button-disabled");
        } else {
            handleClick = this.onClick.bind(this);
        }

        this.setState({
            "handleClick": handleClick,
            "styleClass": styleClass
        });
    }

    render() {
        return (
            <Anchor
                callback={ () => null }
                data={ "..." }
                handleClick={ this.onClick.bind(this) }
                styleClass={ this.state.styleClass }
            />
        );
    }
}

PreferencesButton.propTypes = {
    callback: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
    instructorName: PropTypes.string.isRequired
}

export default PreferencesButton;
