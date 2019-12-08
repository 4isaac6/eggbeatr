/**
 * FILENAME:    Grid.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 18th, 2016
 *
 * This file contains the Grid class for the schedule
 *  content of the lesson calendar web application.
 *
 * The content is displayed here as a table, but
 *  the values will be created in another component.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Table from 'utils/Table';
import Input from 'utils/Input';
import Modal from 'utils/Modal';
import Anchor from 'utils/Anchor';
import Tutorial from 'helpers/Tutorial';
import ExportToPDF from 'functions/ExportToPDF';
import UnorderedList from 'utils/UnorderedList';
import WaitIndicator from 'helpers/WaitIndicator';
import DurationButton from 'specializations/DurationButton';
import SectionDescription from 'helpers/SectionDescription';


class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.durationContainer = [];
        this.state = { ...props.initData };
    }

    componentDidMount() {
        this.init();
        window.addEventListener("click", this.hideModal.bind(this));
    }

    /**
     * Initialize the class members.
     */
    init() {
        var duration;

        // Select the button based on the state duration value.
        if (this.state.data) {
            duration = this.state.data.duration;
        }

        this.props.gridChecklistCallback(
            this.createGridButton,
            this.displayComponentState.bind(this)
        );

        this.setDuration(duration);
        this.setLessonTimes(false);

        this.controllerData = this.props.callback(this.state, "grid", false);
    }

    /**
     * Update the duration button value and display the
     *  correct button as selected.
     */
    setDuration(newDuration) {
        var isDurationSet = false;
        var errorClass = " error-cell";
        var reReplaceCriteria = new RegExp(errorClass, "g");
        var titleStyleClass = this.durationContainer[0].props.styleClass;

        // Update duration field of the state data (passed by reference).
        if (!(newDuration)) {
            // Create new Grid, lesson times.
            this.setLessonTimes(true);
        } else {
            Object.assign(this.state.data, {
                "duration": newDuration
            });

            let gridData = this.gridList.state.data;
            this.setState(this.state, () => {
                // If a grid exists, create a new one with the new duration.
                if (gridData.length > 0) {
                    this.displayComponentState();
                }

                this.props.callback(this.state, "grid", true);
            });
        }

        // Find previously selected duration and remove "selected" class.
        for (let i = 1; i < this.durationContainer.length; i++) {
            let button = this.durationContainer[i];
            let styleClass = button.state.styleClass;
            let duration = button.duration;
            let selectedClass = " pure-menu-selected";
            let reReplaceCriteria = new RegExp(selectedClass, "g");

            if (newDuration === duration) {
                isDurationSet = true;
                button.setState({
                    "styleClass": styleClass.concat(selectedClass)
                });
            } else {
                button.setState({
                    "styleClass": styleClass.replace(reReplaceCriteria, "")
                });
            }
        }

        if (!isDurationSet) {
            this.durationContainer[0].setState({
                "styleClass": titleStyleClass.concat(errorClass)
            });
        } else {
            this.durationContainer[0].setState({
                "styleClass": titleStyleClass.replace(reReplaceCriteria, "")
            });
        }

        this.props.setChecklistQuantity("grid", this.verifyData());
    }

    /**
     * Validate the 'Start Time' input.
     */
    validateStartTime(startTime) {
        var reHour = new RegExp(/^([1-9]|1[0-2])$/);
        var reMinute = new RegExp(/^([0-5][05]|60)$/);
        var [hour, minute] = startTime.split(":");

        return reHour.test(hour) && reMinute.test(minute);
    }

    /**
     * Check that the duration and lessonTimes fields are set in the state.
     */
    verifyData() {
        if (Object.keys(this.state).length === 0) {
            return false;
        }

        var lessonTimes = this.state.data.lessonTimes;
        var reDuration = new RegExp(/^([1-9](\.5)?|0\.5)$/);
        var validDuration = reDuration.test(this.state.data.duration);
        var validLessonTimes = lessonTimes.reduce(
            (result, current) => result && this.validateStartTime(current),
            true
        );

        return validDuration && validLessonTimes && lessonTimes.length > 0;
    }

    /**
     * Sets all 5 possible lesson start times.
     */
    setLessonTimes(e) {
        var isValid;
        var startTime;
        var newLessonTimes;
        var startTimeClassList;
        var startTimeNode = ReactDOM.findDOMNode(this.startTimeInputField);

        if (e && e.target && e.target.nodeName === "INPUT") {
            startTime = e.target.value || e.target.placeholder;
        } else {
            if (this.state.data && this.state.data.lessonTimes) {
                startTime = this.state.data.lessonTimes[0];
            } else {
                startTime = "...";
            }
        }

        // Set initial time.
        newLessonTimes = [startTime];
        isValid = this.validateStartTime(startTime);
        startTimeClassList = startTimeNode.parentElement.classList;
        if (isValid) {
            startTimeClassList.remove("error-cell");

            var [hour, minute] = startTime.split(":");
            hour = parseInt(hour, 10);
            minute = parseInt(minute, 10);

            // Maximum amount of slots is 5.
            for (let slot = 0; slot < 4; slot++) {
                let newTime;

                minute = (minute + 30) % 60;

                if (minute < 30) {
                    hour = hour % 12 + 1;
                }

                if (minute < 10) {
                    minute = "0" + minute;
                }

                newTime = [hour, minute].join(":");

                newLessonTimes.push(newTime);
            }
        } else {
            startTimeClassList.add("error-cell");
        }

        if (e) {
            if (this.state && this.state.data && this.state.data.id) {
                Object.assign(this.state.data, {
                    "lessonTimes": newLessonTimes
                });

                this.setState(this.state, () => {
                    this.props.callback(this.state, "grid", true);
                });
            } else {
                this.setState({
                    "data": {
                        "duration": 0,
                        "lessonTimes": newLessonTimes
                    }
                });

                this.props.createComponent(this.state.data, "Grid")
                    .then((res) => this.setState(res));
            }
        }

        this.startTimeInputField.setState({
            "data": "",
            "placeholder": startTime
        });

        this.props.setChecklistQuantity("grid", this.verifyData());
    }

    /**
     * Display a notification if no Grids are created with
     *  the number of instructors to be added to create a
     *  Grid, given duration and lesson quantities are constant.
     */
    noGridsNotification(duration, numInstructors, numHalfLessons, numThreeQuarterLessons) {
        var noGridsString = "Add 0 Instructor";

        var instructorTime = duration * numInstructors;
        var lessonTime = 0.5 * numHalfLessons + 0.75 * numThreeQuarterLessons;

        var numAddInstructors = Math.floor((lessonTime - instructorTime) / duration) + 1;

        if (isNaN(numAddInstructors) || numAddInstructors < 1) {
            this.handleGridError();
            return;
        }

        var notification = noGridsString.replace(/[0-9]/, numAddInstructors);

        if (numAddInstructors !== 1) {
            notification = notification + "s";
        }

        var data = this.emptyGridsNotification.state.data;
        var styleClass = this.emptyGridsNotification.state.styleClass;
        this.emptyGridsNotification.setState({
            "data": [
                data[0],
                Object.assign(data[1], {
                    "data": [notification]
                })
            ],
            "styleClass": styleClass.replace("is-invisible", "is-visible")
        });

        this.waitIndicator.setState({
            "indicatorStyleClass": "is-invisible",
            "spinnerStyleClass": "is-invisible"
        });
    }

    /**
     * Returns an HTML to style a table cell based on
     *  code for split cell.
     */
    getSplitCell(code, reactKey) {
        var privatesLeft;
        var privatesRight;
        var child = null;
        var childClassName = null;

        if (code.includes("3")) {
            child = React.createElement("p", {
                "className": childClassName,
                "key": reactKey + "-work"
            }, "Work");
        } else if (code.includes("4")) {
            privatesLeft = React.createElement("div", {
                "className": "privates-left",
                "key": reactKey + "-privates"
            });

            privatesRight = React.createElement("div", {
                "className": "privates-right",
                "key": reactKey + "-privates"
            });
        }

        var lineLeft = React.createElement("div", {
            "className": "line line-left",
            "key": reactKey + "-line"
        }, child);
        var lineRight = React.createElement("div", {
            "className": "line line-right",
            "key": reactKey + "-line"
        }, child);

        var block;
        switch (code) {
            case "02":
            case "32":
                block = [lineLeft];
                break;
            case "20":
            case "22":
            case "23":
                block = [lineRight];
                break;
            case "04":
            case "24":
                block = [lineLeft, privatesRight];
                break;
            case "40":
            case "42":
                block = [lineRight, privatesLeft];
                break;
            default:
                block = [];
        };

        return block;
    }

    /**
     * Creates an array of lessons, divided to two arrays:
     *  1/2 hour & 3/4 hour.
     */
    createLessonQueue() {
        var newQueue = [[], [], ["Work"]];
        var data = this.controllerData.lessons.data;
        var threeQuarterLessons = [
            "Level 6",
            "Level 7",
            "Level 8",
            "Level 9",
            "Level 10",
            "Basics I",
            "Basics II",
            "Strokes",
            "Schoolboard"
        ];

        for (let key in data) {
            let value = data[key];
            let keyArray = Array(value.quantity).fill(key);

            if (threeQuarterLessons.includes(key)) {
                newQueue[1] = newQueue[1].concat(keyArray);
            } else {
                newQueue[0] = newQueue[0].concat(keyArray);
            }
        }

        return newQueue;
    }

    /**
     * Sums the number of preferred lessons.
     */
    getPreferenceLength(newInstructor) {
        var instructor = this.controllerData.instructorPreferences.data[newInstructor];

        return instructor.lessons.length;
    }

    /**
     * Randomizes the contents of the array.
     */
    randomizeArray(array) {
        var i, tmp;
        var l = array.length;

        // While there remain elements to shuffle.
        while (l > 0) {
            // Pick a remaining element.
            i = Math.floor(Math.random() * l--);

            // Swap with the current element.
            tmp = array[l];
            array[l] = array[i];
            array[i] = tmp;
        }

        return array;
    }

    /**
     * Orders the instructors by the length of their
     *  preferences, in ascending order.
     * Instructors with empty preference objects are
     *  appended randomly to the array.
     */
    orderInstructorsByPreferencesSize() {
        var newInstructorOrder = [];
        var instructorPreferenceLengths = [];

        for (let instructorName in this.controllerData.instructorPreferences.data) {
            var preferenceSize = this.getPreferenceLength(instructorName);

            instructorPreferenceLengths.push({
                "instructorName": instructorName,
                "preferenceSize": preferenceSize
            });
        }

        instructorPreferenceLengths.sort((current, previous) => {
            return current.preferenceSize - previous.preferenceSize;
        }).forEach((instructorPreference) => {
            newInstructorOrder.push(instructorPreference.instructorName);
        });

        var noPreferenceInstructors = this.controllerData.instructorsArray.filter((instructor) => {
            return !newInstructorOrder.includes(instructor);
        });

        var randomOrderInstructors = this.randomizeArray(noPreferenceInstructors);

        // Append instructors without preferences' index in random order.
        return newInstructorOrder.concat(randomOrderInstructors);;
    }

    /**
     * Return a list on the names of the privates-only instructors.
     */
    getPrivatesOnlyInstructors() {
        return this.controllerData.instructorsArray.filter((value) => {
            var instructor = this.controllerData.instructors.data[value];
            return instructor.privatesOnly;
        });
    }

    /**
     * Return a list of the names of instructors that teach group lessons.
     */
    getGroupInstructors() {
        return this.controllerData.instructorsArray.filter((value) => {
            var instructor = this.controllerData.instructors[value];
            return !instructor.privatesOnly;
        });
    }

    /**
     * Assigns lessons to slots based on the instructors' preferences
     */
    assignLessons(instructor, index, q, reactKey) {
        var lessonCode = instructor[index];
        var prefs = this.controllerData.instructorPreferences;

        // If the slot locarion is a code (string), it isn't a lesson.
        if (typeof lessonCode === "string") {
            instructor[index] = this.getSplitCell(lessonCode, reactKey);

            return q;
        }

        // There are no stand alone '3' cells.
        if (lessonCode === 1 || lessonCode === 2) {
            let assigned = false;
            let instructorName = instructor[0];
            let typedLessons = q[lessonCode - 1];

            if (instructorName in prefs) {
                let prefLessonsByCode = [];
                let lessonPrefs = prefs[instructorName].lessons;

                for (let lessonIndex = 0; lessonIndex < lessonPrefs.length; lessonIndex++) {
                    if (typedLessons.includes(lessonPrefs[lessonIndex])) {
                        prefLessonsByCode.push(lessonPrefs[lessonIndex])
                    }
                }

                for (let lesson = 0; lesson < typedLessons.length; lesson++) {
                    if (prefLessonsByCode.includes(typedLessons[lesson])) {
                        lessonCode = typedLessons.splice(lesson, 1)[0];

                        assigned = true;
                        break;
                    }
                }
            }

            // No preferred lesson is found.
            if (!assigned) {
                lessonCode = typedLessons.splice(0, 1)[0];
            }
        } else if (lessonCode === 4) {
            lessonCode = "Private";
        } else {
            lessonCode = "";
        }

        instructor[index] = lessonCode;
    }

    /**
     * Gets an array created by the GridFactory, server-side.
     */
    getGridArrays(lessonQueue) {
        return this.props.getGrids(
            Object.assign(this.controllerData, {
                "duration": this.state.data.duration,
                "lessonTimes": this.state.data.lessonTimes,
                "privatesOnlyInstructors": this.getPrivatesOnlyInstructors()
            })
        )
            .then((newGrids) => this.modifyGridArrays(newGrids, lessonQueue))
            .catch((error) => console.error(error));
    }

    /**
     * Modifies the array to map to swim levels.
     */
    modifyGridArrays(newGrids, lessonQueue) {
        var instructorOrder = this.orderInstructorsByPreferencesSize();

        // Set allocated lessons slots to lessons.
        for (let grid = 0; grid < newGrids.length; grid++) {
            let queue = JSON.parse(JSON.stringify(lessonQueue));

            for (let name = 0; name < instructorOrder.length; name++) {
                for (let slot = 1; slot < newGrids[grid][0].length; slot++) {
                    for (let instructor = 1; instructor < newGrids[grid].length; instructor++) {
                        let reactKey = "key-grid-" + name + instructor + slot;

                        if (newGrids[grid][instructor][0] === instructorOrder[name]) {
                            this.assignLessons(newGrids[grid][instructor], slot, queue, reactKey);

                            break;
                        }
                    }
                }
            }
        }

        return newGrids;
    }

    /**
     * Display notification if error occurs while creating grids.
     */
    handleGridError() {
        this.waitIndicator.setState({
            "data": [
                "ERROR",
                <p key="key-grid-indicator-0">An error occured creating grids.<br />Please contact administrator.</p>
            ],
            "indicatorStyleClass": "is-visible",
            "labelStyleClass": "create-error",
            "spinnerStyleClass": "is-invisible"
        });
    }

    /**
     * Display the grids.
     */
    displayComponentState() {
        var lessonQueue = this.createLessonQueue();
        var wrapperClass = this.tutorial.state.wrapperClass;

        this.gridList.setState({
            "data": []
        });

        this.waitIndicator.setState({
            "data": "creating...",
            "indicatorStyleClass": "is-visible",
            "labelStyleClass": "",
            "spinnerStyleClass": "is-visible"
        });

        // Update controllerData with components' data.
        this.controllerData = this.props.callback(this.state, "grid", false);

        // Get base array to represent grid.
        this.getGridArrays(lessonQueue)
            .then(gridArrays => this.displayGrid(gridArrays, lessonQueue))
            .catch((error) => {
                console.error(error);
                this.handleGridError();
            });

        this.tutorial.setState({
            "wrapperClass": wrapperClass.concat(" hide")
        });
    }

    /**
     * Transforms an array to a PureCSS table.
     * The first row of the array is considered as the Header of the table.
     */
    displayGrid(gridArrays, lessonQueue) {
        var duration = this.state.data.duration;
        var gridList = ReactDOM.findDOMNode(this.gridList);
        var emptyStyleClass = this.emptyGridsNotification.state.styleClass;

        if (gridArrays.length === 0) {
            let instructors = this.getGroupInstructors();

            this.noGridsNotification(
                duration,
                instructors.length,
                this.controllerData.lessons.half,
                this.controllerData.lessons.threequarter
            );

            return;
        }

        this.emptyGridsNotification.setState({
            "styleClass": emptyStyleClass.replace("is-visible", "is-invisible")
        });

        // Hide tutorial message, error notification, & current grids.
        this.tutorial.setState({
            "wrapperClass": "content-section-footer hide"
        });

        this.createGridList(duration, gridArrays, lessonQueue);

        // Fit viewing window to the Grids' size.
        var newWidth = 128 * (2 * duration + 1.25);
        var gridContainer = gridList.parentElement;
        gridContainer.style = "width:" + newWidth + "px";

        // Eliminate space conflict with the GridChecklist.
        var cHeight;
        var newHeight;
        var dynamicGrid = document.getElementById("dynamicGrid");
        var instructors = Object.keys(this.controllerData.instructors);

        cHeight = dynamicGrid.clientHeight;
        newHeight = cHeight + (40 * (instructors.length - 3));

        if (instructors.length > 3) {
            dynamicGrid.style.height = newHeight + "px";
        }

        // Hide loading indicator.
        this.waitIndicator.setState({
            "indicatorStyleClass": "is-invisible",
            "spinnerStyleClass": "is-invisible"
        });
    }

    createTable(duration, gridArrays, gridIndex, lessonQueue) {
        var prevStyle;
        var styleCell;
        var dataBody = [];
        var dataHeader = [];
        var styleBody = {};

        for (let instructor = 0; instructor < gridArrays[gridIndex].length; instructor++) {
            let newData = [];
            let instructorRow = gridArrays[gridIndex][instructor];

            for (let slot = 0; slot < 2 * duration + 1; slot++) {
                let key;
                let style;
                let className = "";
                let cellContents = instructorRow[slot];
                let prevContents = instructorRow[slot - 1];
                let nextContents = instructorRow[slot + 1];

                if (Array.isArray(cellContents)) {
                    style = cellContents[cellContents.length - 1].props.className;
                    key = cellContents[0].key;
                } else {
                    style = null;
                    key = cellContents;
                }

                if (slot === 0) {
                    className = "first-column";
                } else if (style && style.includes("privates-right")) {
                    let nextStyle;

                    if (Array.isArray(nextContents)) {
                        nextStyle = nextContents[nextContents.length - 1].props.className;

                        if (nextStyle.includes("privates-left")) {
                            cellContents[1] = React.cloneElement(
                                cellContents[1],
                                {},
                                "Pri"
                            );
                        }
                    }

                    className = "privates-right";
                } else if (style && style.includes("privates-left")) {
                    if (Array.isArray(prevContents)) {
                        prevStyle = prevContents[prevContents.length - 1].props.className;

                        if (prevStyle.includes("privates-right")) {
                            cellContents[1] = React.cloneElement(
                                cellContents[1],
                                {},
                                "vate"
                            );
                        }
                    }

                    className = "privates-left no-border";
                } else if (cellContents === "Private") {
                    className = "privates-cell";

                    if (prevStyle && prevStyle.includes("privates-right")) {
                        className += " no-border";
                    }
                }

                if (prevContents && Array.isArray(prevContents)) {
                    if (lessonQueue[1].includes(cellContents) || cellContents.includes("Private")) {
                        className += " no-border is-left";
                    }
                } else if (cellContents && Array.isArray(cellContents)) {
                    if (lessonQueue[1].includes(prevContents)) {
                        className += " no-border";
                    }
                }

                if (Array.isArray(cellContents)) {
                    newData.push(cellContents);
                } else {
                    newData.push([cellContents]);
                }

                styleBody[key] = className.replace(/^\s+|\s+$/g, "");
            }

            if (instructor === 0) {
                dataHeader.push(newData);
            } else {
                dataBody.push(newData);
            }
        }

        styleCell = (contents) => {
            var className = null;
            var data = contents[0];

            if (typeof data === "string" && data in styleBody) {
                className = styleBody[data];
            } else if (typeof data === "object") {
                let k = data.key;

                if (k in styleBody) {
                    className = styleBody[k];
                }
            }

            return className;
        };

        return React.createElement(Table, {
            "dataBody": dataBody,
            "dataHeader": dataHeader,
            "key": "key-grid-table-" + gridIndex,
            "styleCell": styleCell,
            "styleRow": (index) => index % 2 ? "table-even" : "table-odd",
            "styleTable": "pure-table"
        });
    }

    createGridList(duration, gridArrays, lessonQueue) {
        for (let gridIndex = 0; gridIndex < gridArrays.length; gridIndex++) {
            let newTable = this.createTable(duration, gridArrays, gridIndex, lessonQueue);

            let newTableAnchor = React.createElement(Anchor, {
                "callback": () => null,
                "data": [newTable],
                "handleClick": this.showModal.bind(this),
                "key": "key-grid-anchor-" + gridIndex,
                "styleClass": "pure-menu-link"
            });

            this.gridList.setState({
                "data": this.gridList.state.data.concat({
                    "data": [newTableAnchor],
                    "styleClass": "pure-menu-item"
                })
            });
        }
    }

    /**
     * Update the content in the Grid modal.
     */
    addModalContent(tableListElement) {
        var prev;
        var next;
        var index;
        var reHashNumber = new RegExp(/#[0-9]+/);
        var disabledClass = " pure-button-disabled";
        var header = this.gridModal.state.header[0];
        var prevStyle = this.prevButton.state.styleClass;
        var nextStyle = this.nextButton.state.styleClass;
        var reReplaceCriteria = new RegExp(disabledClass, "g");
        var childCollection = Array.from(tableListElement.parentNode.children);

        index = childCollection.findIndex((c) => c === tableListElement);

        // Update modal header with Grid number.
        header = header.replace(reHashNumber, "#" + (index + 1));

        Object.assign(this.gridModal.state.header, [
            header,
            this.gridModal.state.header[1]
        ]);
        this.gridModal.setState(this.gridModal.state);

        // Rebind 'previous' button.
        if (index > 0) {
            prev = childCollection[index - 1];
            this.prevButton.setState({
                "handleClick": () => {
                    this.addModalContent(prev);
                },
                "styleClass": prevStyle.replace(reReplaceCriteria, "")
            });
        } else {
            this.prevButton.setState({
                "handleClick": () => null,
                "styleClass": prevStyle.concat(disabledClass)
            });
        }

        // Rebind 'next' button.
        if (index < childCollection.length - 1) {
            next = childCollection[index + 1];
            this.nextButton.setState({
                "handleClick": () => {
                    this.addModalContent(next);
                },
                "styleClass": nextStyle.replace(reReplaceCriteria, "")
            });
        } else {
            this.nextButton.setState({
                "handleClick": () => null,
                "styleClass": nextStyle.concat(disabledClass)
            });
        }

        Object.assign(this.gridModal.state, {
            "body": this.gridList.state.data[index].data
        });
        this.gridModal.setState(this.gridModal.state);
    }

    /**
     * Add and show the modal contents.
     */
    showModal(e) {
        this.addModalContent(e.target.closest("li"));

        this.gridModal.setState({
            "isDisplayed": true
        });
    }

    /**
     * Remove and hide the modal contents.
     */
    hideModal(e) {
        var modal = ReactDOM.findDOMNode(this.gridModal);
        if (e.target === modal) {
            this.gridModal.setState({
                "isDisplayed": false
            });

            Object.assign(this.gridModal.state, {
                "body": []
            });

            this.gridModal.setState(this.gridModal.state);
        }
    }

    /**
     * Create a PDF of the Grid.
     */
    exportToPDF() {
        var header = this.props.getSetTitle();
        var exporter = new ExportToPDF();
        exporter.pdf(header);
    }

    /**
     * Set the reference to subcomponent references.
     */
    setComponentReference(name, reference) {
        this[name] = reference;
    }

    render() {
        return (
            <div>
                <h2 className="content-head is-right">
                    The Grid
                </h2>
                <SectionDescription
                    additionalData={ [
                        React.createElement(UnorderedList, {
                            "callback": (ref) => this.setComponentReference("emptyGridsNotification", ref),
                            "data": [
                                {
                                    "data": ["No Grids were created"],
                                    "styleClass": "pure-menu-item pure-menu-selected"
                                },
                                {
                                    "data": ["Add 0 Instructor"],
                                    "styleClass": "pure-menu-item pure-menu-selected"
                                }
                            ],
                            "handleClick": () => null,
                            "key": "key-grid-description-0",
                            "styleClass": "pure-menu-list right-button is-invisible"
                        })
                    ] }
                    anchorCallback={ (ref) => this.setComponentReference("createGridButton", ref) }
                    anchorHandleClick={ () => null }
                    buttonText={ "Create Grid" }
                    data={ [
                        "Select the duration",
                        "Cycle through the possible grids",
                        "Inspect each grid"
                    ] }
                    title={ "Create a lesson calendar" }
                    type={ "content" }
                />
                <div className="pure-menu-heading">
                    Start Time:
                    <Input
                        callback={ (ref) => this.setComponentReference("startTimeInputField", ref) }
                        handleBlur={ this.setLessonTimes.bind(this) }
                        placeholder={ "..." }
                        type={ "text" }
                    />
                </div>
                <div className="pure-menu pure-menu-horizontal">
                    <UnorderedList
                        data={ [
                            {
                                "data": [
                                    React.createElement(Anchor, {
                                        "callback": (ref) => this.setComponentReference(
                                            "durationContainer",
                                            this.durationContainer.concat(ref)
                                        ),
                                        "data": "Duration",
                                        "handleClick": () => null,
                                        "key": "key-grid-anchor-0",
                                        "styleClass": "pure-menu-heading"
                                    })
                                ],
                                "styleClass": "pure-menu-item"
                            },
                            {
                                "data": [
                                    React.createElement(DurationButton, {
                                        "callback": (ref) => this.setComponentReference(
                                            "durationContainer",
                                            this.durationContainer.concat(ref)
                                        ),
                                        "data": "1\u00BD hours",
                                        "handleClick": this.setDuration.bind(this),
                                        "key": "key-grid-anchor-1"
                                    })
                                ],
                                "styleClass": "pure-menu-item"
                            },
                            {
                                "data": [
                                    React.createElement(DurationButton, {
                                        "callback": (ref) => this.setComponentReference(
                                            "durationContainer",
                                            this.durationContainer.concat(ref)
                                        ),
                                        "data": "2 hours",
                                        "handleClick": this.setDuration.bind(this),
                                        "key": "key-grid-anchor-2"
                                    })
                                ],
                                "styleClass": "pure-menu-item"
                            },
                            {
                                "data": [
                                    React.createElement(DurationButton, {
                                        "callback": (ref) => this.setComponentReference(
                                            "durationContainer",
                                            this.durationContainer.concat(ref)
                                        ),
                                        "data": "2\u00BD hours",
                                        "handleClick": this.setDuration.bind(this),
                                        "key": "key-grid-anchor-3"
                                    })
                                ],
                                "styleClass": "pure-menu-item"
                            }
                        ] }
                        styleClass={ "pure-menu-list" }
                    />
                </div>
                <WaitIndicator
                    callback={ (ref) => this.setComponentReference("waitIndicator", ref) }
                    data={ "Creating..." }
                />
                <div className="pure-menu pure-menu-horizontal pure-menu-scrollable">
                    <UnorderedList
                        callback={ ((ref) => this.setComponentReference("gridList", ref)) }
                        data={ [] }
                        updateProps={ false }
                    />
                </div>
                <Modal
                    body={ [] }
                    callback={ (ref) => this.setComponentReference("gridModal", ref) }
                    footer={ [
                        React.createElement(Anchor, {
                            "callback": (ref) => this.setComponentReference("prevButton", ref),
                            "data": "Previous",
                            "handleClick": () => null,
                            "key": "key-grid-anchor-4",
                            "styleClass": "pure-button float-left"
                        }),
                        React.createElement(Anchor, {
                            "callback": (ref) => this.setComponentReference("nextButton", ref),
                            "data": "Next",
                            "handleClick": () => null,
                            "key": "key-grid-anchor-5",
                            "styleClass": "pure-button float-right"
                        })
                    ] }
                    header={ [
                        "Grid #0",
                        React.createElement(Anchor, {
                            "data": "Export to PDF",
                            "handleClick": this.exportToPDF.bind(this),
                            "key": "key-grid-anchor-5",
                            "styleClass": "pure-button"
                        })
                    ] }
                    tableData={ {
                        "dataBody": [],
                        "dataHeader": [],
                        "styleCell": () => null,
                        "styleRow": () => null,
                        "styleTable": "pure-table"
                    } }
                />
                <Tutorial
                    buttonClass={ "" }
                    callback={ (ref) => this.setComponentReference("tutorial", ref) }
                    data={ "Create a grid, and I'll get cooking." }
                    headingClass={ "content-head" }
                    nextName={ "" }
                    step={ 4 }
                    wrapperClass={ "content-section-footer hide" }
                />
            </div>
        );
    }
}

Grid.propTypes = {
    callback: PropTypes.func.isRequired,
    createComponent: PropTypes.func.isRequired,
    getGrids: PropTypes.func.isRequired,
    gridChecklistCallback: PropTypes.func.isRequired,
    getSetTitle: PropTypes.func.isRequired,
    initData: PropTypes.object.isRequired,
    removeComponent: PropTypes.func.isRequired,
    setChecklistQuantity: PropTypes.func.isRequired
}

export default Grid;
