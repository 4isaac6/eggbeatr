/**
 * FILENAME:    InstructorTable.js
 * AUTHOR:      Isaac Streight
 * START DATE:  December 2nd, 2018
 *
 * This file contains the InstructorTable class, a specialization class for
 *  the table for the Instructors section of the application.
 */

import React from 'react';
import PropTypes from 'prop-types';

import ToggleTable from 'specializations/ToggleTable';
import PreferencesButton from 'specializations/PreferencesButton';
import PrivatesOnlyCheckbox from 'specializations/PrivatesOnlyCheckbox';


class InstructorTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = null;
        this.toggleTable = null;
        this.preferencesButtons = null;
        this.privatesOnlyCheckboxes = null;
    }

    componentWillMount() {
        this.preferencesButtons = [];
        this.privatesOnlyCheckboxes = [];

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
            "dateOfHire": inputValues[1],
            "instructor": inputValues[0],
            "privateOnly": false,
            "wsiExpiration": inputValues[2]
        });
    }

    /**
     * Check if the WSI certification date is expiring or expired.
     */
    checkWSIExpiration(expiryTime) {
        const sixtyDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;

        expiryTime = Date.parse(expiryTime);

        if (isNaN(expiryTime)) {
            return false;
        }

        if (expiryTime < Date.now()) {
            return "error-cell";
        } else if (expiryTime < Date.now() + sixtyDaysInMilliseconds) {
            return "warning-cell";
        }
    }

    getAdditionalRowData(instructor, index) {
        var checkboxObject;
        var prefsButtonObject;

        checkboxObject = this.getPrivatesOnlyCheckbox(instructor[4], index);
        prefsButtonObject = this.getPreferencesButton(instructor[5], index);

        instructor.splice(4, 1, checkboxObject);
        instructor.splice(5, 1, prefsButtonObject);
    }

    getCellValidations() {
        return [
            (cell) => /^[A-Za-z\s]+$/.test(cell),
            (cell) => !isNaN(Date.parse(cell)),
            () => false
        ];
    }

    getPreferencesButton(prefConfig, keyIndex) {
        return [
            React.createElement(PreferencesButton, {
                "callback": (ref) => this.preferencesButtons.push(ref),
                "handleClick": () => null,
                "instructorId": prefConfig.instructorId,
                "instructorName": prefConfig.instructorName,
                "key": "key-instructor-pref-" + keyIndex
            })
        ];
    }

    getPrivatesOnlyCheckbox(privatesOnlyConfig, keyIndex) {
        return [
            React.createElement(PrivatesOnlyCheckbox, {
                "callback": (ref) => this.privatesOnlyCheckboxes.push(ref),
                "checked": privatesOnlyConfig.privateOnly,
                "handleChange": () => null,
                "instructorId": privatesOnlyConfig.instructorId,
                "key": "key-instructor-checkbox-" + keyIndex
            })
        ];
    }

    remove(instructorId) {
        // Remove preference button of removed instructor.
        this.preferencesButtons.forEach((prefButton, prefIndex) => {
            if (prefButton.state.instructorId === instructorId) {
                this.preferencesButtons.splice(prefIndex, 1);
            }
        });

        // Remove checkbox of removed instructor.
        this.privatesOnlyCheckboxes.forEach((privatesCheckbox, privIndex) => {
            if (privatesCheckbox.state.instructorId === instructorId) {
                this.privatesOnlyCheckboxes.splice(privIndex, 1);
            }
        });

        this.state.removeCallback(instructorId);
    }

    // Give this to the Edit Instructors button.
    toggleState(enable) {
        for (var rowIndex = 0; rowIndex < this.privatesOnlyCheckboxes.length; rowIndex++) {
            var checkbox = this.privatesOnlyCheckboxes[rowIndex];
            var preferenceButton = this.preferencesButtons[rowIndex];

            checkbox.toggleState(enable);
            preferenceButton.toggleState(enable);
        }

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
                    this.state.callback(this);
                } }
                componentType={ "Instructors" }
                customStyle={ this.checkWSIExpiration.bind(this) }
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

InstructorTable.defaultProps = {
    toggle: false
};

InstructorTable.propTypes = {
    addCallback: PropTypes.func.isRequired,
    callback: PropTypes.func.isRequired,
    dataBody: PropTypes.array.isRequired,
    dataHeader: PropTypes.array.isRequired,
    removeCallback: PropTypes.func.isRequired,
    sectionId: PropTypes.string,
    toggle: PropTypes.bool,
    updateCallback: PropTypes.func.isRequired
}

export default InstructorTable;
