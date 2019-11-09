/**
 * FILENAME:    Checkbox.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 31th, 2018
 *
 * This file contains the Checkbox class, a utility class for checkbox-type
 *  input tags in the application.
 */

import React from 'react';
import PropTypes from 'prop-types';


class Checkbox extends React.Component {
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

    handleChange(e) {
        this.toggleValue(!this.state.checked);
        this.state.handleChange(e.target);
    }

    toggleState(disable) {
        this.setState({
            "disabled": disable
        });
    }

    toggleValue(enable) {
        this.setState({
            "checked": enable
        });
    }

    render() {
        return (
            <input
                checked={ this.state.checked }
                disabled={ this.state.disabled }
                onChange={ this.handleChange.bind(this) }
                type="checkbox"
            />
        );
    }
}

Checkbox.defaultProps = {
    checked: false,
    disabled: false
};

Checkbox.propTypes = {
    callback: PropTypes.func,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    handleChange: PropTypes.func.isRequired
}

export default Checkbox;
