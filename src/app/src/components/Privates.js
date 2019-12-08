/**
 * FILENAME:    Privates.js
 * AUTHOR:      Isaac Streight
 * START DATE:  November 1st, 2016
 *
 * This file contains the Privates class for the collection
 *  of private lessons for the web application.
 * The Privates class is exported.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Tutorial from 'helpers/Tutorial';
import PrivatesTable from 'specializations/PrivatesTable';
import SectionDescription from 'helpers/SectionDescription';


class Privates extends React.Component {
    constructor(props) {
        super(props);

        this.state = { ...props.initData };
    }

    componentDidMount() {
        this.props.callback(this.state, "privates", false);
        this.props.setChecklistQuantity("privates", this.getComponentQuantity());
    }

    /**
     * Places the Privates table in a state where the
     *  contents of the table can be changed.
     * The data in the input field will replace any data
     *  that was previously in the table cell.
     * Leaving any input field empty will not replace the
     *  original data.
     */
    editPrivates() {
        // Set state to update values for placeholders in PrivatesTable props.
        this.setState(this.state);

        // Re-name and re-bind 'Edit Instructors' button.
        this.editButton.setState({
            "data": "Finish Editing",
            "handleClick": this.finishEditingPrivates.bind(this)
        }, () => this.privatesTable.toggleState(true));
    }

    /**
     * Saves changes made in input fields to specific cell.
     * Empty inputs will leave the cell with its
     *  original data.
     */
    finishEditingPrivates() {
        // Re-name and re-bind 'Finish Editing' button.
        this.editButton.setState({
            "data": "Edit Privates",
            "handleClick": this.editPrivates.bind(this)
        }, () => this.privatesTable.toggleState(false));

        this.props.callback(this.state, "privates", true);
        this.props.setChecklistQuantity("privates", this.getComponentQuantity());
    }

    displayComponentState() {
        this.sortPrivates([this.state.data]);
    }

    /**
     * Count the number of private lessons.
     */
    getComponentQuantity() {
        if (Object.keys(this.state).length === 0) {
            return 0;
        }

        var numPrivates = 0;

        for (let instructor in this.state.data) {
            numPrivates += this.state.data[instructor].length;
        }

        return numPrivates;
    }

    /**
     * Given the name of an instructor, return the instructor's ID.
     */
    getInstructorIdByName(instructorName) {
        if (instructorName in this.state.data) {
            let privateLesson = this.state.data[instructorName][0];

            return new Promise((resolve) => resolve(privateLesson.instructorId));
        } else {
            return this.props.getInstructorData()
                .then((res) => {
                    var instructors = res.data;
                    var instructor = instructors[instructorName];

                    return instructor.id;
                }).catch(error => console.error(error));
        }
    }

    /**
     * Find the private lesson object & instructor name by id.
     */
    findPrivateById(id) {
        var privatesId = parseInt(id, 10);

        for (let instructorName in this.state.data) {
            let privateLesson = this.state.data[instructorName];

            for (let i = 0; i < privateLesson.length; i++) {
                if (privateLesson[i].id === privatesId) {
                    return [privateLesson[i], instructorName, i];
                }
            }
        }

        return [false, "", -1];
    }

    /**
     * Sort object keys alphabetically into the state.
     */
    sortPrivates(privates) {
        if (privates === undefined) {
            return;
        }

        var obj = {};
        var allKeys = [];

        // Extract keys from the new set of privates.
        for (let i = 0; i < privates.length; i++) {
            allKeys = allKeys.concat(Object.keys(privates[i]));
        }

        // Eliminate duplicate keys.
        allKeys = Array.from(new Set(allKeys));

        allKeys.sort().forEach((key) => {
            obj[key] = [];

            for (let i = 0; i < privates.length; i++) {
                if (key in privates[i]) {
                    let sortedTimes = this.sortPrivatesByTime(privates[i][key]);

                    obj[key] = obj[key].concat(sortedTimes);
                }
            }
        });

        this.setState({
            "data": obj
        });
    }

    /**
     * Sort object by time attribute.
     */
    sortPrivatesByTime(privates) {
        if (privates.length === 1) {
            return privates;
        }

        var obj = [];
        var allTimes = [];

        for (let i = 0; i < privates.length; i++) {
            allTimes.push(privates[i].time);
        }

        // Eliminate duplicate keys.
        allTimes = Array.from(new Set(allTimes));

        allTimes.sort((firstEl, secondEl) => {
            var [firstHour, firstSeconds] = firstEl.split(":");
            var [secondHour, secondSeconds] = secondEl.split(":");

            if (parseInt(firstHour) === parseInt(secondHour)) {
                return parseInt(firstSeconds) < parseInt(secondSeconds);
            } else {
                return parseInt(firstHour) > parseInt(secondHour);
            }
        }).forEach((time) => {
            for (let i = 0; i < privates.length; i++) {
                if (time === privates[i].time) {
                    obj.push(privates[i]);
                }
            }
        });

        return obj;
    }

    getTableBody() {
        var tableBody = [];

        for (let instructorName in this.state.data) {
            var instructor = this.state.data[instructorName];

            for (let lessonIndex = 0; lessonIndex < instructor.length; lessonIndex++) {
                let privateLesson = instructor[lessonIndex];
                let tableRow = [
                    privateLesson.id,
                    instructorName,
                    privateLesson.time,
                    privateLesson.duration
                ];

                tableBody.push(tableRow);
            }
        }

        return tableBody;
    }

    getTableHeader() {
        return [[
            "Instructor",
            "Time",
            "Duration"
        ]];
    }

    /**
     * Add a private lesson to the state and database via the Add button in the Instructors table.
     */
    addPrivateLesson(privateLessonBody) {
        return this.getInstructorIdByName(privateLessonBody.instructor)
            .then((res) => {
                // Get instructor ID by instructor name.
                privateLessonBody.duration = parseInt(privateLessonBody.duration, 10);
                privateLessonBody.instructorId = res;
                delete privateLessonBody.instructor;
            })
            .then(() => this.props.createComponent(privateLessonBody, "Privates"))
            .then((res) => {
                this.sortPrivates([this.state.data, res.data]);

                return res;
            }).catch(error => console.error(error));
    }

    /**
     * Remove a private lesson from the state via instructor ID passed by the Remove button.
     */
    removePrivateLesson(instructorId) {
        var privateLessons = JSON.parse(JSON.stringify(this.state.data));

        for (let instructorName in privateLessons) {
            let lessonArray = privateLessons[instructorName];

            for (let lessonIndex = 0; lessonIndex < lessonArray.length; lessonIndex++) {
                let lesson = lessonArray[lessonIndex];

                if (lesson.id === instructorId) {
                    this.props.removeComponent(instructorId, "Privates").then(() => {
                        // Remove the  private lesson.
                        lessonArray.splice(lessonIndex, 1);

                        // Remove the instructor if there are no private lessons.
                        if (lessonArray.length === 0) {
                            delete privateLessons[instructorName];
                        }

                        this.setState({
                            "data": privateLessons
                        }, () => this.privatesTable.toggleState(true));
                    });

                    break;
                }
            }
        }
    }

    /**
     * Update values from the PrivatesTable to the state and the database via the input fields in the table.
     */
    updatePrivateLesson(id, newDataRow) {
        var privateLessons = this.state.data;
        var newInstructorName = newDataRow[0];
        var privateLesson, instructorName, lessonIndex;
        var privateLessonBody = {
            "time": newDataRow[1],
            "duration": newDataRow[2]
        };

        [privateLesson, instructorName, lessonIndex] = this.findPrivateById(id);

        //Apply updates to time and duration.
        Object.assign(privateLesson, privateLessonBody);

        if (instructorName === newInstructorName) {
            this.props.callback(this.state, "privates", true);
        } else {
            this.getInstructorIdByName(newInstructorName)
                .then((newInstructorId) => {
                    if (newInstructorName in privateLessons) {
                        // Add to new instructor.
                        privateLesson.instructorId = newInstructorId;
                        privateLessons[newInstructorName].push(privateLesson);

                        // Remove from old instructor.
                        privateLessons[instructorName].splice(lessonIndex, 1);

                        // Remove the instructor if there are no private lessons.
                        if (privateLessons[instructorName].length === 0) {
                            delete privateLessons[instructorName];
                        }
                    } else {
                        privateLesson.instructorId = newInstructorId;
                    }

                    this.props.callback(this.state, "privates", true);
                }).catch(error => console.error(error));
        }
    }

    /**
     * Set the reference to subcomponent references.
     */
    setComponentReference(name, reference) {
        this[name] = reference;
    }

    render() {
        return (
                <div className="pure-u-1 pure-u-md-1-2 pure-u-lg-3-5">
                    <h2 className="content-head content-head-ribbon">
                        Private Lessons
                    </h2>
                    <SectionDescription
                        anchorCallback={ (ref) => this.setComponentReference("editButton", ref) }
                        anchorHandleClick={ this.editPrivates.bind(this) }
                        buttonText={ "Edit Privates" }
                        data={ [
                            "Organize private lessons from the set",
                            "Specify the who, when, and how long",
                            "Modify their frequencies"
                        ] }
                        title={ "Detail private lessons" }
                        type={ "ribbon" }
                    />
                    <PrivatesTable
                        addCallback={ this.addPrivateLesson.bind(this) }
                        callback={ (ref) => this.setComponentReference("privatesTable", ref) }
                        dataBody={ this.getTableBody() }
                        dataHeader={ this.getTableHeader() }
                        removeCallback={ this.removePrivateLesson.bind(this) }
                        updateCallback={ this.updatePrivateLesson.bind(this) }
                    />
                    <Tutorial
                        buttonClass={ "pure-button pure-button-primary" }
                        data={ "List any private lessons occuring during this set." }
                        headingClass={ "content-head content-head-ribbon" }
                        nextName={ "dynamicGrid" }
                        step={ 3 }
                        wrapperClass={ "ribbon-section-footer hide" }
                    />
                </div>
        );
    }
}

Privates.propTypes =  {
    callback: PropTypes.func.isRequired,
    initData: PropTypes.object.isRequired,
    createComponent: PropTypes.func.isRequired,
    getInstructorData: PropTypes.func.isRequired,
    removeComponent: PropTypes.func.isRequired,
    setChecklistQuantity: PropTypes.func.isRequired
}

export default Privates;
