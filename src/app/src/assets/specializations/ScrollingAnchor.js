/**
 * FILENAME:    ScrollingAnchor.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 31th, 2018
 *
 * This file contains the ScrollingAnchor class, a specialization class for anchor tags
 *  in the application.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Anchor from 'utils/Anchor';
import FnScroll from 'functions/FnScroll';


class ScrollingAnchor extends React.Component {
    constructor(props) {
        super(props);

        this.state = null;
    }

    componentWillMount() {
        this.setState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    handleClick() {
        var target = "dynamic" + this.node.innerHTML;

        if (target.includes("eggbeatr")) {
            target = "dynamicHeader";
        }

        FnScroll.scroll(document.getElementById(target));
    }

    render() {
        return (
            <Anchor
                data={ this.state.data }
                handleClick={ this.handleClick }
                styleClass={ this.state.styleClass }
            />
        );
    }
}

ScrollingAnchor.defaultProps = {
    styleClass: "pure-menu-link"
}

ScrollingAnchor.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    styleClass: PropTypes.string
}

export default ScrollingAnchor;
