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

import Grid from './Grid';
import About from './About';
import Header from './Header';
import Footer from './Footer';
import Landing from './Landing';
import Lessons from './Lessons';
import Private from './Private';
import Connector from './Connector';
import Instructors from './Instructors';
import GridChecklist from './GridChecklist';
import InstructorPreferences from './InstructorPreferences';


class Controller extends React.Component {
    constructor(props) {
        super(props);

        this.controllerData = {};
        this.serverURI = 'http://localhost:8081';
        this.connector = new Connector({
            serverURI: this.serverURI
        });

        var populate = this.getPopulateParameter();

        var initializations = [
            this.connector.getGridData(populate).then(res => this.init("grid", res)),
            this.connector.getInstructorData(populate).then(res => this.init("instructors", res)),
            this.connector.getLessonData(populate).then(res => this.init("lessons", res)),
            this.connector.getPreferenceData(populate).then(res => this.init("instructorPreferences", res)),
            this.connector.getPrivatesData(populate).then(res => this.init("privates", res))
        ];

        Promise.all(initializations)
            .then(() => this.renderComponents())
            .catch(error => console.error(error));
    }

    /**
     * Store the data locally, as returned from the
     *  asynchronous call.
     */
    init(classVariable, res) {
        this[classVariable] = res;
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
        var grid;
        var header;
        var lessons;
        var privates;
        var instructors;
        var gridChecklist;
        var instructorPreferences;

        console.log("rendering components...");

        // Render components to static div tags.
        ReactDOM.render(<Header />, document.getElementById('dynamicHeader'));
        ReactDOM.render(<Landing />, document.getElementById('dynamicLanding'));
        ReactDOM.render(<About />, document.getElementById('dynamicAbout'));
        ReactDOM.render(<Footer />, document.getElementById('dynamicFooter'));

        grid = ReactDOM.render(<Grid
            callback={this.gridCallback}
            initData={this.grid}
            connector={this.connector}
            controller={this}
        />, document.getElementById('dynamicGrid'));

        gridChecklist = ReactDOM.render(<GridChecklist
            createGridHandler={grid.generateGrid.bind(grid)}
        />, document.getElementById('dynamicGridChecklist'));

        instructorPreferences = ReactDOM.render(<InstructorPreferences
            callback={this.instructorPreferencesCallback}
            initData={this.instructorPreferences}
            connector={this.connector}
            controller={this}
        />, document.getElementById('dynamicInstructorPreferences'));

        instructors = ReactDOM.render(<Instructors
            callback={this.instructorsCallback}
            initData={this.instructors}
            connector={this.connector}
            controller={this}
            instructorPreferences={instructorPreferences}
            setChecklistQuantity={gridChecklist.setQuantity.bind(gridChecklist)}
        />, document.getElementById('dynamicInstructors'));

        lessons = ReactDOM.render(<Lessons
            callback={this.lessonsCallback}
            initData={this.lessons}
            connector={this.connector}
            controller={this}
            setChecklistQuantity={gridChecklist.setQuantity.bind(gridChecklist)}
        />, document.getElementById('dynamicLessons'));

        privates = ReactDOM.render(<Private
            callback={this.privateCallback}
            connector={this.connector}
            controller={this}
            initData={this.privates}
            setChecklistQuantity={gridChecklist.setQuantity.bind(gridChecklist)}
        />, document.getElementById('dynamicPrivate'));
    }

    /**
     * Callback to store data from Grid.js
     */
    gridCallback(_grid, controller, minimize) {
        console.log("retrieving data from Grid.js...");

        console.log("grid: ", controller.grid);
        controller.grid = jQuery.extend(true, {}, _grid);
        console.log("grid: ", controller.grid);

        console.log("adding data from Grid.js to controllerData...");

        var database = minimize;
        if (minimize) {
            database = "Grid";
        }

        controller.manipulateData(database);
    }

    /**
     * Callback to store data from Instructors.js
     */
    instructorsCallback(_instructor, controller, minimize) {
        console.log("retrieving data from Instructors.js...");

        console.log("instructors: ", controller.instructors);
        controller.instructors = jQuery.extend(true, {}, _instructor);
        console.log("instructors: ", controller.instructors);

        console.log("adding data from Instructors.js to controllerData...");

        var database = minimize;
        if (minimize) {
            database = "Instructors";
        }

        controller.manipulateData(database);
    }

    /**
     * Callback to store data from InstructorsPreferences.js
     */
    instructorPreferencesCallback(_instructorPreference, controller, minimize) {
        console.log("retrieving data from InstructorsPreferences.js...");

        console.log("instructorPreferences: ", controller.instructorPreferences);
        controller.instructorPreferences = jQuery.extend(true, {}, _instructorPreference);
        console.log("instructorPreferences: ", controller.instructorPreferences);

        console.log("adding data from InstructorsPreferences.js to controllerData...");

        var database = minimize;
        if (minimize) {
            database = "InstructorPreferences";
        }

        controller.manipulateData(database);
    }

    /**
     * Callback to store data from Lessons.js
     */
    lessonsCallback(_lesson, controller, minimize) {
        console.log("retrieving data from Lessons.js...");

        console.log("lessons: ", controller.lessons);
        controller.lessons = jQuery.extend(true, {}, _lesson);
        console.log("lessons: ", controller.lessons);

        console.log("adding data from Lessons.js to controllerData...");

        var database = minimize;
        if (minimize) {
            database = "Lessons";
        }

        controller.manipulateData(database);
    }

    /**
     * Callback to store data from Private.js
     */
    privateCallback(_private, controller, minimize) {
        console.log("retrieving data from Private.js...");

        console.log("private: ", controller.privates);
        controller.privates = jQuery.extend(true, {}, _private);
        console.log("private: ", controller.privates);

        console.log("adding data from Private.js to controllerData...");

        var database = minimize;
        if (minimize) {
            database = "Privates";
        }

        controller.manipulateData(database);
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
            "Level 5"
        ];
        var threeQuarterLessons = [
            "Level 6",
            "Level 7",
            "Level 8",
            "Level 9",
            "Level 10",
            "Basics I",
            "Basics II",
            "Strokes"
        ];

        this.lessons.half = 0;
        this.lessons.threequarter = 0;

        for (var lesson in this.lessons) {
            if (halfLessons.includes(lesson)) {
                this.lessons.half += this.lessons[lesson].quantity;
            } else if (threeQuarterLessons.includes(lesson)) {
                this.lessons.threequarter += this.lessons[lesson].quantity;
            }
        }
    }

    checkWSIExpiration(expiryTime) {
        const sixtyDaysInMilliseconds = 60 * 24 * 60 * 60 * 1000;

        return Date.parse(expiryTime) > Date.now() + sixtyDaysInMilliseconds;
    }

    /**
     * Organizes data from the Lessons, Instructors, and Private components.
     * Duration of lessons set is contained in the Grid component.
     */
    manipulateData(database) {
        console.log("manipulating controllerData...");

        if (database) {
            this.minimizeData(database);
        }

        this.quantifyLessonTypes();

        // Add instructors to controllerData.
        this.controllerData.instructors = jQuery.extend(true, {}, this.instructors);

        // Add instructor instructorPreferences to controllerData.
        this.controllerData.instructorPreferences = jQuery.extend(true, {}, this.instructorPreferences);

        // Array of valid instructors.
        var instructorsArray = Object.keys(this.controllerData.instructors);
        instructorsArray = instructorsArray.filter((instructorName) => {
            var instructor = this.controllerData.instructors[instructorName];

            return this.checkWSIExpiration(instructor.wsiExpiration);
        });
        this.controllerData.instructorsArray = instructorsArray;

        // Add lesson quantites and number of 1/2 & 3/4 hour lessons to controllerData.
        this.controllerData.lessons = jQuery.extend(true, {}, this.lessons);

        // Add private lessons to controllerData.
        this.controllerData.private = jQuery.extend(true, {}, this.privates);

        return this.controllerData;
    }

    /**
     * Reduces the size of the objects to be passed to GridFactory.
     *
     * Reductions:
     *      instructors             - no reductions
     *      instructorPreferences   - remove keys for empty pairings
     *                              - remove if all/no preferences exist
     *      lessons                 - remove keys for empty pairings
     *      private                 - remove empty private lessons
     */
    minimizeData(database) {
        console.log("minimizing controllerData...");

        /**
         * Eliminate empty strings and arrays in instructorPreferences.
         * Eliminate instructorPreferences if all keys are full.
         */
        for (var instructor in this.instructorPreferences) {
            var instructorPreferences = this.instructorPreferences[instructor];

            // Delete key-value pairing if all values are filled or empty.
            if (instructorPreferences.length === 0 || instructorPreferences.length === 21) {
                delete this.instructorPreferences[instructor];
            }
        }

        // Remove keys in lessons paired with the empty string.
        for (var value in this.lessons) {
            if (this.lessons[value] === 0) {
                delete this.lessons[value];
            }
        }

        // Remove instructors in Privates without private lessons.
        for (var instructor in this.privates) {
            if (jQuery.isEmptyObject(this.privates[instructor])) {
                delete this.privates[instructor];
            }
        }

        this.updateDatabase(database);
    }

    /**
     * Set the gathered data in the database.
     */
    updateDatabase(database) {
        console.log("Sending updates to database \"" + database + "\"...");

        if (database === "Grid") {
            console.log("Updating Grid...");
            this.connector.updateGridData(this.grid)
                .then(gridRes => console.log("Updated Grid:", gridRes));
        } else if (database === "Instructors") {
            console.log("Updating Instructors...");
            var instructorUpdates = [];
            for (var key in this.instructors) {
                var instructor = this.instructors[key];
                var id = instructor.id;
                var body = {
                    "instructor": key,
                    "dateOfHire": instructor.dateOfHire,
                    "wsiExpiration": instructor.wsiExpiration
                };

                instructorUpdates.push(this.connector.updateInstructorData(id, body));
            }

            Promise.all(instructorUpdates).then((instructorRes) => {
                this.instructors = this.assignUpdates(instructorRes);

                console.log("Updated Instructors:", this.instructors);
            });
        } else if (database === "Lessons") {
            console.log("Updating Lessons...");
            var lessonsUpdates = [];
            for (var key in this.lessons) {
                if (key === "half" || key === "threequarter") {
                    continue;
                }

                var lesson = this.lessons[key];
                var id = lesson.id;
                var body = {
                    "quantity": lesson.quantity
                };

                lessonsUpdates.push(this.connector.updateLessonData(id, body));
            }

            Promise.all(lessonsUpdates).then((lessonRes) => {
                this.lessons = this.assignUpdates(lessonRes);

                console.log("Updated Lessons:", this.lessons);
            });
        } else if (database === "InstructorPreferences") {
            console.log("Updating InstructorPreferences...");
            var preferenceUpdates = [];
            for (var key in this.instructorPreferences) {
                var preference = this.instructorPreferences[key];
                var id = preference.id;
                var body = {
                    "instructorId": preference.instructorId,
                    "lessons": preference.lessons
                };

                preferenceUpdates.push(this.connector.updatePreferenceData(id, body));
            }

            Promise.all(preferenceUpdates).then((preferenceRes) => {
                this.instructorPreferences = this.assignUpdates(preferenceRes);

                console.log("Updated InstructorPreferences:", this.instructorPreferences);
            });
        } else if (database === "Privates") {
            console.log("Updating Privates...");
            var privateUpdates = [];
            for (var key in this.privates) {
                var privateInstructor = this.privates[key];

                for (var i = 0; i < privateInstructor.length; i++) {
                    var privateLesson = privateInstructor[i];
                    var id = privateLesson.id;
                    var body = {
                        "duration": privateLesson.duration,
                        "instructorId": privateLesson.instructorId,
                        "time": privateLesson.time
                    };

                    privateUpdates.push(this.connector.updatePrivatesData(id, body))
                }
            }

            Promise.all(privateUpdates).then((privateRes) => {
                this.privates = this.assignUpdates(privateRes);

                console.log("Updated Privates:", this.privates);
            });
        }

        console.log("All updates sent to \"" + database + "\".");
    }

    assignUpdates(res) {
        var object = {};

        for (var i = 0; i < res.length; i++) {
            Object.assign(object, res[i]);
        }

        return object;
    }
}

export default Controller;
