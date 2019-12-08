/**
 * FILENAME:    Instructors.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 25th, 2016
 *
 * This file contains the Intructors class for
 *  the collection of instructors for the lesson
 *  calendar web application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Modal from 'utils/Modal';
import Anchor from 'utils/Anchor';
import EditButton from 'specializations/EditButton';


class InstructorPreferences extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...props.initData };
        this.defaultPreferences = [
            ["Starfish", "Sea Otter", "Level 1", "Level 6", "Basics I"],
            ["Duck", "Salamander", "Level 2", "Level 7", "Basics II"],
            ["Sea Turtle", "Sunfish", "Level 3", "Level 8", "Strokes"],
            ["", "Crocodile", "Level 4", "Level 9", ""],
            ["Simple Set", "Whale", "Level 5", "Level 10", "Schoolboard"]
        ];

        if (Object.keys(props.initData) > 0) {
            this.selectedInstructor = Object.keys(props.initData.data)[0];
        }
    }

    componentDidMount() {
        var dynamicInstructorPreferences = document.getElementById("dynamicInstructorPreferences");

        // Hide modal on click outside of modal.
        window.addEventListener("click", (e) => {
            if (e.target === ReactDOM.findDOMNode(this.modal)) {
                this.modal.setState({
                    "isDisplayed": false
                });
            } else if (e.target.classList.contains("preferences") || dynamicInstructorPreferences.contains(e.target)) {
                this.modal.setState({
                    "isDisplayed": true
                });
            }
        });
    }

    /**
     * Remove an instructor's preferences from the state.
     */
    deletePreference(instructorName) {
        if (instructorName in this.state.data) {
            delete this.state.data[instructorName]
        }
    }

    /**
     * Style the cell based on instructor preferences.
     */
    getCellStyle(data, index) {
        var isSelected;
        var preference;
        var lesson = data[0];
        var cellClass = "is-left ";
        var lessonType = lesson.props.data;
        var instructor = this.selectedInstructor;

        if (Object.keys(this.state).length > 0 && instructor in this.state.data) {
            preference = this.state.data[instructor];
            isSelected = preference.lessons.includes(lessonType);
        } else {
            isSelected = false;
        }

        // Style non-selected cells.
        if (!isSelected && this.editButton) {
            if (this.editButton.state.mode === "edit") {
                cellClass += "remove-preference-";
            } else {
                cellClass += "hide-preference-";
            }

            cellClass += (index % 2) ? "even" : "odd";
        }

        return cellClass;
    }

    /**
     * Update selection status of a preference cell and
     *  update the state of the preferences.
     */
    updatePreferenceCell(e) {
        if (this.editButton.state.mode === "default") {
            return;
        }

        var preferences;
        var lessonIndex;
        var lesson = e.target.innerHTML;
        var instructor = this.selectedInstructor;

        preferences = JSON.parse(JSON.stringify(this.state.data[instructor]));

        lessonIndex = preferences.lessons.indexOf(lesson);
        if (lessonIndex > -1) {
            preferences.lessons.splice(lessonIndex, 1);
        } else {
            preferences.lessons.push(lesson);
        }

        Object.assign(this.state.data[instructor], preferences);
        this.setState(this.state);
    }

    /**
     * Edit the lesson preference cells.
     */
    getPreferenceButtons() {
        var preferences = JSON.parse(JSON.stringify(this.defaultPreferences));

        for (let rowIndex = 0; rowIndex < preferences.length; rowIndex++) {
            let row = preferences[rowIndex];

            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                let lessonType = row[colIndex];

                preferences[rowIndex][colIndex] = [
                    React.createElement(Anchor, {
                            "data": lessonType,
                            "handleClick": this.updatePreferenceCell.bind(this),
                            "key": "key-anchor-" + (rowIndex * preferences.length + colIndex),
                            "styleClass": ""
                        }
                    )
                ];
            }
        }

        return preferences;
    }

    /**
     * Displays preference modal.
     */
    displayComponentState(instructorName) {
        this.selectedInstructor = instructorName;

        if (instructorName in this.state.data) {
            this.setState(this.state, () => this.modal.setState({
                "header": [instructorName],
                "isDisplayed": true
            }));
        } else {
            // Fetch new data and set state for instructors without preferences.
            this.props.getPreferenceData()
                .then((res) => {
                    this.setState(res, () => this.modal.setState({
                        "header": [instructorName],
                        "isDisplayed": true
                    }));
                });
        }
    }

    /**
     * Sets the state of the Preferences table to
     *  allow removal of cells.
     */
    edit() {
        this.editButton.setState({
            "handleClick": this.finishEditing.bind(this),
            "mode": "edit"
        }, () => this.setState(this.state));
    }

    /**
     * Removes the 'remove-preference' and 'add-preference'
     *  spans from the Preferences table .
     */
    finishEditing() {
        this.editButton.setState({
            "handleClick": this.edit.bind(this),
            "mode": "default"
        }, () => this.setState(
            this.state,
            () => this.props.callback(this.state, "instructorPreferences", true)
        ));
    }

    /**
     * Store a reference to the React object.
     */
    setComponentReference(name, reference) {
        this[name] = reference
    }

    render() {
        return (
            <Modal
                body={ [
                    <p key="key-modal-p-0">
                        The following table outlines {
                            this.selectedInstructor
                        }&#39;s level preferences.
                    </p>
                ] }
                callback={ (ref) => this.setComponentReference("modal", ref) }
                footer={ [
                    React.createElement(EditButton, {
                        "callback": (ref) => this.setComponentReference("editButton", ref),
                        "handleClick": this.edit.bind(this),
                        "key": "key-preferences-footer-0"
                    })
                ] }
                header={ [ this.selectedInstructor ] }
                tableData={ {
                    "dataBody": this.getPreferenceButtons(),
                    "dataHeader": [[
                        "Parent & Tot",
                        "Pre-School",
                        "Swim Kids",
                        "Swim Kids",
                        "Teens & Adults"
                    ]],
                    "styleCell": this.getCellStyle.bind(this),
                    "styleRow": (index) => index % 2 ? "table-even" : "table-odd",
                    "styleTable": "pure-table"
                } }
            />
        );
    }
}

InstructorPreferences.propTypes = {
    callback: PropTypes.func.isRequired,
    getPreferenceData: PropTypes.func.isRequired,
    initData: PropTypes.object.isRequired
}

export default InstructorPreferences;
