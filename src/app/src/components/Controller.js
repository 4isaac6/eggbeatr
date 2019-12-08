/**
 * FILENAME:    Controller.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 30th, 2017
 *
 * This file contains the Controller class that renders the major components
 *  of the lesson calendar web application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Grid from 'components/Grid';
import About from 'components/About';
import Header from 'components/Header';
import Footer from 'components/Footer';
import Landing from 'components/Landing';
import Lessons from 'components/Lessons';
import Privates from 'components/Privates';
import Connector from 'components/Connector';
import Instructors from 'components/Instructors';
import GridChecklist from 'components/GridChecklist';
import InstructorPreferences from 'components/InstructorPreferences';


class Controller extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "components": {},
            "componentObjects": {},
            "controllerData": {},
            "connector": new Connector({
                "githubURI": this.props.githubURI,
                "serverURI": this.props.serverURI
            })
        };
    }

    /**
     * Send requests to get initial data for the components.
     */
    async init() {
        var populate = this.getPopulateParameter();

        await this.state.connector.pingServer();

        var initializations = [
            this.state.connector.getHeaderData(populate).then(res => this.setComponentData("header", res, false)),
            this.state.connector.getGridData(populate).then(res => this.setComponentData("grid", res, false)),
            this.state.connector.getInstructorData(populate).then(res => this.setComponentData("instructors", res, false)),
            this.state.connector.getLessonData(populate).then(res => this.setComponentData("lessons", res, false)),
            this.state.connector.getPreferenceData(populate).then(res => this.setComponentData("instructorPreferences", res, false)),
            this.state.connector.getPrivatesData(populate).then(res => this.setComponentData("privates", res, false))
        ];

        return Promise.all(initializations)
            .catch(error => console.error(error));
    }

    /**
     * Store the data locally, as returned from the
     *  asynchronous call.
     */
    setComponentData(classVariable, res, isComponentObject) {
        if (isComponentObject) {
            this.state.componentObjects[classVariable] = res;
        } else {
            this.state.components[classVariable] = res;
        }
    }

    /**
     * Get parameter from the query string, detailing how
     *  to seed the starting data.
     */
    getPopulateParameter() {
        var validPopulates = ["db", "default", "none"];
        var searchParams = new URLSearchParams(location.search);

        var populate = searchParams.get("populate");

        if (!(validPopulates.includes(populate))) {
            populate = "db";
        }

        return populate;
    }

    /**
     * Renders the major components to static div tags.
     * Callback functions are passed to each of these components along with a
     *  reference to the Controller object.
     */
    renderComponents() {
        console.log("rendering components...");

        var _this = this;
        var setGridChecklistQuantity;
        var connector = this.state.connector;
        var components = this.state.components;
        var componentObjects = this.state.componentObjects;

        // Store functions as local variables to be passed to components.
        var createComponent = this.createComponent.bind(this);
        var removeComponent = this.removeComponent.bind(this);
        var setComponentData = this.setComponentData.bind(this);
        var componentCallback = this.componentCallback.bind(this);

        this.renderComponent(
            Landing, {}, document.getElementById("dynamicLanding")
        );

        this.renderComponent(
            About, {}, document.getElementById("dynamicAbout")
        );

        this.renderComponent(Footer, {
            "callback": componentCallback
        }, document.getElementById("dynamicFooter"), function() {
            setComponentData("footer", this, true);
        });

        this.renderComponent(Header, {
                "callback": componentCallback,
                "createComponent": createComponent,
                "initData": components.header,
                "removeComponent": removeComponent,
                "serverStatus": connector.state.connectionStatus
            }, document.getElementById("dynamicHeader"), function() {
                setComponentData("header", this, true);

                // Check the connection to the server every 60 seconds.
                setInterval(() => {
                    var prevStatus = connector.state.connectionStatus;

                    _this.updateServerStatus(prevStatus)
                        .then((status) => prevStatus = status);
                }, 60000);
        });

        this.renderComponent(GridChecklist, {
        }, document.getElementById("dynamicGridChecklist"), function() {
            setComponentData("gridChecklist", this, true);
        });

        setGridChecklistQuantity = componentObjects.gridChecklist.setQuantity.bind(componentObjects.gridChecklist);

        this.renderComponent(Grid, {
                "callback": componentCallback,
                "createComponent": createComponent,
                "getGrids": connector.getGridArrays.bind(this),
                "gridChecklistCallback": componentObjects.gridChecklist.setCreateGridComponents.bind(componentObjects.gridChecklist),
                "initData": components.grid,
                "getSetTitle": componentObjects.header.getSelectedSet.bind(componentObjects.header),
                "removeComponent": removeComponent,
                "setChecklistQuantity": setGridChecklistQuantity
            }, document.getElementById("dynamicGrid"), function() {
                setComponentData("grid", this, true);
        });

        this.renderComponent(InstructorPreferences, {
                "callback": componentCallback,
                "getPreferenceData": connector.getPreferenceData,
                "initData": components.instructorPreferences
            }, document.getElementById("dynamicInstructorPreferences"),
            function() {
                setComponentData("instructorPreferences", this, true);
        });

        this.renderComponent(Instructors, {
                "callback": componentCallback,
                "createComponent": createComponent,
                "deletePreference": componentObjects.instructorPreferences.deletePreference.bind(componentObjects.instructorPreferences),
                "handlePreferencesClick": componentObjects.instructorPreferences.displayComponentState.bind(componentObjects.instructorPreferences),
                "initData": components.instructors,
                "removeComponent": removeComponent,
                "setChecklistQuantity": setGridChecklistQuantity
            }, document.getElementById("dynamicInstructors"), function() {
                setComponentData("instructors", this, true);
        });

        this.renderComponent(Lessons, {
                "callback": componentCallback,
                "createComponent": createComponent,
                "initData": components.lessons,
                "setChecklistQuantity": setGridChecklistQuantity
            }, document.getElementById("dynamicLessons"), function() {
                setComponentData("lessons", this, true);
        });

        this.renderComponent(Privates, {
                "callback": componentCallback,
                "createComponent": createComponent,
                "initData": components.privates,
                "getInstructorData": connector.getInstructorData,
                "removeComponent": removeComponent,
                "setChecklistQuantity": setGridChecklistQuantity
            }, document.getElementById("dynamicPrivates"), function() {
                setComponentData("privates", this, true);
        });

        connector.getReleaseVersion()
            .then(res => {
                var headerState = JSON.parse(JSON.stringify(components.header));

                if (headerState.data) {
                    Object.assign(headerState.data, {
                        "versionName": res.data.name
                    });
                } else {
                    headerState.data = {
                        "versionName": res.data.name
                    };
                }

                componentObjects.footer.setState(res);
                componentObjects.header.setState(headerState);
            }).catch(error => console.error(error));
    }

    /**
     * Render custom React object.
     */
    renderComponent(component, props, domLocation, callback) {
        ReactDOM.render(
            React.createElement(component, props),
            domLocation,
            callback
        );
    }

    /**
     * Store component data locally.
     */
    componentCallback(component, componentName, updateDatabase) {
        console.log("retrieving data from " + componentName + ".js...");

        console.log(componentName + ": ", this.state.components[componentName]);
        this.state.components[componentName] = JSON.parse(
            JSON.stringify(component)
        );
        console.log(componentName + ": ", this.state.components[componentName]);

        console.log("adding data from " + componentName + ".js to controllerData...");

        if (componentName === "header") {
            if (component.data.selectedSet.id) {
                this.state.connector.setHeaderId(component.data.selectedSet.id);
            }

            return this.init().then(() => this.updateComponents(updateDatabase));
        } else {
            return this.manipulateData(componentName, updateDatabase);
        }
    }

    /**
     * Update the compoents' data and the UI representation of the data.
     */
    updateComponents(updateComponent) {
        if (!updateComponent) {
            return;
        }

        for (let name in this.state.componentObjects) {
            let comp = this.state.componentObjects[name];

            if (name === "header") {
                continue;
            }

            if (this.state.components[name] !== undefined) {
                /*
                 * Updated InstructorPreferences to store class members in state and use utility and specialized components.
                 * Update Controller and Connector to reflect changes in InstructorPreferences.
                 */
                if (name === "instructorPreferences") {
                    let instructorPreferencesComponent = comp;
                    instructorPreferencesComponent.state = this.state.components[name];
                } else if (name === "grid") {
                    let gridComponent = comp;
                    gridComponent.state = this.state.components[name];

                    gridComponent.init();
                } else if (name === "instructors") {
                    let instructorsComponent = comp;
                    instructorsComponent.state = this.state.components[name];

                    this.state.componentObjects.gridChecklist.setQuantity(
                        "instructors",
                        instructorsComponent.getComponentQuantity()
                    );

                    instructorsComponent.displayComponentState();
                } else if (name === "lessons") {
                    let lessonsComponent = comp;
                    lessonsComponent.state = this.state.components[name];

                    this.state.componentObjects.gridChecklist.setQuantity(
                        "lessons",
                        lessonsComponent.getComponentQuantity()
                    );

                    lessonsComponent.displayComponentState();
                } else if (name === "privates") {
                    let privatesComponent = comp;
                    privatesComponent.state = this.state.components[name];

                    this.state.componentObjects.gridChecklist.setQuantity(
                        "privates",
                        privatesComponent.getComponentQuantity()
                    );

                    privatesComponent.displayComponentState();
                }
            }
        }
    }

    /**
     * Sums the number of 1/2-hour lesson types and 3/4-hour lesson types.
     */
    quantifyLessonTypes() {
        var halfLessons = [
            "Starfish",
            "Duck",
            "Sea Turtle",
            "Sea Otter",
            "Salamander",
            "Sunfish",
            "Crocodile",
            "Whale",
            "Level 1",
            "Level 2",
            "Level 3",
            "Level 4",
            "Level 5",
            "Simple Set"
        ];
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
        var quantities = {
            "half": 0,
            "threequarter": 0
        };

        var lessons = this.state.components.lessons.data;
        for (let lessonType in lessons) {
            let lesson = lessons[lessonType];

            if (halfLessons.includes(lessonType)) {
                quantities.half += lesson.quantity;
            } else if (threeQuarterLessons.includes(lessonType)) {
                quantities.threequarter += lesson.quantity;
            }
        }

        return quantities;
    }

    /**
     * Organizes data from the Lessons, Instructors, and Privates components.
     * Duration of lessons set is contained in the Grid component.
     */
    manipulateData(componentName, updateDatabase) {
        console.log("manipulating controllerData...");

        if (updateDatabase) {
            this.updateServerStatus(this.state.connector.state.connectionStatus)
                .then((status) => {
                    if (status) {
                        this.updateDatabase(componentName);
                    }
                });
        }

        // Add instructors to controllerData.
        this.state.controllerData.instructors = JSON.parse(
            JSON.stringify(this.state.components.instructors)
        );

        // Add instructorPreferences to controllerData.
        this.state.controllerData.instructorPreferences = JSON.parse(
            JSON.stringify(this.state.components.instructorPreferences)
        );

        // Array of valid instructors.
        var instructors = this.state.controllerData.instructors.data;
        if (instructors !== undefined) {
            this.state.controllerData.instructorsArray = Object.keys(instructors);
        }

        // Add lesson quantites and number of 1/2 & 3/4 hour lessons to controllerData.
        this.state.controllerData.lessons = Object.assign(
            JSON.parse(JSON.stringify(this.state.components.lessons)),
            this.quantifyLessonTypes()
        );

        // Add private lessons to controllerData.
        this.state.controllerData.privates = JSON.parse(
            JSON.stringify(this.state.components.privates)
        );

        return this.state.controllerData;
    }

    /**
     * Set the gathered data in the database.
     */
    updateDatabase(database) {
        console.log("Sending updates to database \"" + database + "\"...");

        if (database === "grid") {
            this.state.connector.updateGridData(this.state.components.grid.data.id, this.state.components.grid.data)
                .then(gridRes => console.log("Updated Grid:", gridRes));
        } else if (database === "instructors") {
            let instructorUpdates = [];
            let instructorsData = this.state.components.instructors.data;

            for (let key in instructorsData) {
                let instructor = instructorsData[key];
                let id = instructor.id;
                let body = {
                    "instructor": key,
                    "dateOfHire": instructor.dateOfHire,
                    "privatesOnly": instructor.privatesOnly,
                    "wsiExpiration": instructor.wsiExpiration
                };

                instructorUpdates.push(this.state.connector.updateInstructorData(id, body));
            }

            Promise.all(instructorUpdates).then((instructorRes) => {
                this.state.components.instructors = this.assignUpdates(instructorRes);

                console.log("Updated Instructors:", this.state.components.instructors);
            });
        } else if (database === "lessons") {
            let lessonsUpdates = [];
            let lessonData = this.state.components.lessons.data;

            for (let key in lessonData) {
                let lesson = lessonData[key];
                let id = lesson.id;
                let body = {
                    "quantity": lesson.quantity
                };

                lessonsUpdates.push(this.state.connector.updateLessonData(id, body));
            }

            Promise.all(lessonsUpdates).then((lessonRes) => {
                this.state.components.lessons = this.assignUpdates(lessonRes);

                console.log("Updated Lessons:", this.state.components.lessons);
            });
        } else if (database === "instructorPreferences") {
            let preferenceUpdates = [];
            let preferenceData = this.state.components.instructorPreferences.data;

            for (let key in preferenceData) {
                let preference = preferenceData[key];
                let id = preference.id;
                let body = {
                    "instructorId": preference.instructorId,
                    "lessons": preference.lessons
                };

                preferenceUpdates.push(this.state.connector.updatePreferenceData(id, body));
            }

            Promise.all(preferenceUpdates).then((preferenceRes) => {
                this.state.components.instructorPreferences = this.assignUpdates(preferenceRes);

                console.log("Updated InstructorPreferences:", this.state.components.instructorPreferences);
            });
        } else if (database === "privates") {
            let privatesUpdates = [];
            let privatesData = this.state.components.privates.data;

            for (let key in privatesData) {
                let privateInstructor = privatesData[key];

                for (let i = 0; i < privateInstructor.length; i++) {
                    let privateLesson = privateInstructor[i];
                    let id = privateLesson.id;
                    let body = {
                        "duration": privateLesson.duration,
                        "instructorId": privateLesson.instructorId,
                        "time": privateLesson.time
                    };

                    privatesUpdates.push(this.state.connector.updatePrivatesData(id, body));
                }
            }

            Promise.all(privatesUpdates).then((privatesRes) => {
                this.state.components.privates = this.assignUpdates(privatesRes);

                console.log("Updated Privates:", this.state.components.privates);
            });
        }

        console.log("All updates sent to \"" + database + "\".");
    }

    assignUpdates(res) {
        var obj = {};

        if (res.includes(undefined)) {
            return { "data": obj };
        } else {
            var emptyObjects = res
                .filter((element) => Object.keys(element) == 0);

            if (emptyObjects.length === res.length) {
                return { "data": obj };
            }
        }

        for (let i = 0; i < res.length; i++) {
            let keys = Object.keys(res[i]);

            keys = Object.keys(res[i].data);

            if (keys.length !== 1) {
                continue;
            }

            let key = keys[0];
            if (Array.isArray(obj[key])) {
                obj[key] = obj[key].concat(res[i].data[key]);
            } else {
                Object.assign(obj, res[i].data);
            }
        }

        return { "data": obj };
    }

    /**
     * Add a component instance to the database.
     */
    createComponent(body, component) {
        var promise;

        console.log("Sending create new " + component + " request to database...");

        if (component === "Header") {
            promise = this.state.connector.setHeaderData(body);
        } else if (component === "Instructor") {
            promise = this.state.connector.setInstructorData(body);
        } else if (component === "Privates") {
            promise = this.state.connector.setPrivatesData(body);
        } else if (component === "Grid") {
            promise = this.state.connector.setGridData(body);
        } else if (component === "Lesson") {
            promise = this.state.connector.setLessonData(body);
        }

        console.log("Sent create new " + component + " request to database.");

        return promise.then((res) => {
            console.log("Created new " + component + ":", res);
            return res;
        }).catch(error => console.error(error));
    }

    /**
     * Remove an instructor from the database.
     */
    removeComponent(id, component) {
        var promise;

        console.log("Sending delete " + component + " request to database...");

        if (component === "Header") {
            promise = this.state.connector.deleteHeaderData(id);
        } else if (component === "Instructor") {
            promise = this.state.connector.deleteInstructorData(id);
        } else if (component === "Privates") {
            promise = this.state.connector.deletePrivatesData(id);
        } else if (component === "Grid") {
            promise = this.state.connector.deleteGridData(id);
        } else if (component === "Lesson") {
            promise = this.state.connector.deleteLessonData(id);
        }

        promise.then((res) => {
            console.log("Deleted " + component + ":", res);
            return res;
        }).catch(error => console.error(error));

        console.log("Sent delete " + component + " request to database.");

        return promise;
    }

    updateServerStatus(prevStatus) {
        return this.state.connector.pingServer().then(() => {
            var status = this.state.connector.state.connectionStatus;

            this.state.componentObjects.header.serverStatus.setState({
                "status": status
            });

            if (!prevStatus && status) {
                // Update state of each component by getting new initData.
                this.init().then(() => this.updateComponents(true));
            }

            return status;
        });
    }
}

Controller.propTypes = {
    githubURI: PropTypes.string.isRequired,
    serverURI: PropTypes.string.isRequired
}

export default Controller;
