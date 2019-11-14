/**
 * FILENAME:    PrivatesTable.js
 * AUTHOR:      Isaac Streight
 * START DATE:  November 10th, 2018
 *
 * This file contains the PrivatesTable class, a specialization class for
 *  the table for the Privates section of the application.
 */

import React from 'react';
import PropTypes from 'prop-types';

import ToggleTable from 'specializations/ToggleTable';


class PrivatesTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = null;
        this.toggleTable = null;
    }

    componentWillMount() {
        this.setState(this.props);
    }

    componentDidMount() {
        return;
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    add(inputValues) {
        return this.state.addCallback({
            "duration": inputValues[2],
            "instructor": inputValues[0],
            "time": inputValues[1]
        });
    }

    getAdditionalRowData() {
        return;
    }

    getCellValidations() {
        return [
            (cell) => /^[A-Za-z\s]+$/.test(cell),
            (cell) => {
                var [hour, minute] = cell.split(":");
                var reHour = new RegExp(/^0?[0-9]|1[0-2]$/);
                var reMinute = new RegExp(/^([0-5][05]|60)$/);

                return reHour.test(hour) && reMinute.test(minute);
            },
            (cell) => /^([0-5][05]|60)$/.test(parseInt(cell, 10) % 60)
        ];
    }

    remove(instructorId) {
        this.state.removeCallback(instructorId);
    }

    // Give this to the Edit Privates button.
    toggleState(enable) {
        this.toggleTable.toggleState(enable);
    }

    /**
     * Set the reference to subcomponent references.
     */
    setComponentReference(name, reference) {
        this[name] = reference;
    }

    render() {
        return (
            <ToggleTable
                addCallback={ this.add.bind(this) }
                callback={ (ref) => {
                    this.setComponentReference("toggleTable", ref);
                    this.state.callback(ref);
                } }
                componentType={ "Privates" }
                dataBody={ this.state.dataBody }
                dataHeader={ this.state.dataHeader }
                getAdditionalRowData={ this.getAdditionalRowData.bind(this) }
                removeCallback={ this.remove.bind(this) }
                sectionId={ this.state.sectionId }
                updateCallback={ this.state.updateCallback }
                validations={ this.getCellValidations() }
            />
        );
    }
}

PrivatesTable.defaultProps = {
    toggle: false
};

PrivatesTable.propTypes = {
    addCallback: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired,
    dataBody: PropTypes.array.isRequired,
    dataHeader: PropTypes.array.isRequired,
    removeCallback: PropTypes.func.isRequired,
    sectionId: PropTypes.string,
    toggle: PropTypes.bool,
    updateCallback: PropTypes.func.isRequired
}

export default PrivatesTable;
