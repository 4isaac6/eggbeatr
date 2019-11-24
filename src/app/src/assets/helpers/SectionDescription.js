/**
 * FILENAME:    SectionDescription.js
 * AUTHOR:      Isaac Streight
 * START DATE:  May 28th, 2018
 *
 * This file contains the SectionDescription class, a helper class for
 *  the section descriptions of the application in the major component section.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Anchor from 'utils/Anchor';
import UnorderedList from 'utils/UnorderedList';


class SectionDescription extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    getAnchorStyle() {
        if (this.state.type === "content") {
            return "pure-button right-button";
        } else if (this.state.type === "ribbon") {
            return "pure-button left-button";
        }
    }

    getData() {
        var newData = [];
        var data = this.state.data;

        data.forEach((text) => newData.push({
            "data": [text],
            "styleClass": ""
        }));

        return newData;
    }

    getDescriptionStyle() {
        if (this.state.type === "content") {
            return "content-section-description is-right float-right";
        } else if (this.state.type === "ribbon") {
            return "ribbon-section-description";
        }
    }

    getExplanationStyle() {
        if (this.state.type === "content") {
            return "content-section-explanation";
        } else if (this.state.type === "ribbon") {
            return "ribbon-section-explanation";
        }
    }

    render() {
        return (
            <div className={ this.getDescriptionStyle() }>
                { this.state.title }
                <UnorderedList
                    data={ this.getData() }
                    styleClass={ this.getExplanationStyle() }
                />
                <Anchor
                    callback={ this.state.anchorCallback }
                    data={ this.state.buttonText }
                    handleClick={ this.state.anchorHandleClick }
                    styleClass={ this.getAnchorStyle() }
                    updateProps={ false }
                />
                { this.state.additionalData }
            </div>
        );
    }
}

SectionDescription.defaultProps = {
    additionalData: []
}

SectionDescription.propTypes = {
    anchorCallback: PropTypes.func.isRequired,
    additionalData: PropTypes.array,
    anchorHandleClick: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
}

export default SectionDescription;
