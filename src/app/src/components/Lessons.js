/**
 * FILENAME:    Lessons.js
 * AUTHOR:      Isaac Streight
 * START DATE:  November 2nd, 2016
 *
 * This file contains the Intructors class for the
 *  collection of instructors for the web application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Table from 'utils/Table';
import Input from 'utils/Input';
import Animator from 'functions/Animator';
import Tutorial from 'helpers/Tutorial';
import SectionDescription from 'helpers/SectionDescription';


class Lessons extends React.Component {
    constructor(props) {
        super(props);

        this.lessonInputs = [];
        this.state = { ...props.initData };
    }

    componentDidMount() {
        this.displayComponentState();

        this.props.callback(this.state, "lessons", false);
        this.props.setChecklistQuantity("lessons", this.getComponentQuantity());
    }

    /**
     * Get number of stored lessons.
     */
    getComponentQuantity() {
        var numLessons = 0;
        var data = this.state.data;

        for (let lesson in data) {
            numLessons += data[lesson].quantity;
        }

        return numLessons;
    }

    /**
     * Finds values in the input field to store in the state.
     */
    storeLessonValues() {
        var data;
        var missingId;
        var finalPromise;
        var data = this.state.data;
        var savedNotification = ReactDOM.findDOMNode(this).querySelector('div.content-section-description div');

        Animator.fadeIn(savedNotification, 400, 2000, () => {
            Animator.fadeOut(savedNotification, 400);
        });

        this.setLessonValue(() => {
            data = this.state.data;

            missingId = Object.keys(data)
                .filter((value) => data[value].id === undefined);

            if (missingId.length > 0) {
                finalPromise = this.createDatabaseEntry(missingId);
            } else {
                finalPromise = new Promise((resolve) => resolve());
            }

            finalPromise.then(() => {
                this.props.callback(this.state, "lessons", true);
                this.props.setChecklistQuantity("lessons", this.getComponentQuantity());
            });
        });
    }

    /**
     * Store the values from the input fields.
     */
    setLessonValue(cb) {
        this.lessonInputs.forEach((lessonInput) => {
            var lessonData;
            var newLesson = {};
            var lessonId = undefined;
            var lessonType = lessonInput.state.name;
            var lessonValue = +lessonInput.state.value;
            var reSingleDigit = new RegExp(/^[0-9]$/);
            var inputNode = ReactDOM.findDOMNode(lessonInput);
            var cellClassList = inputNode.parentElement.classList;

            if (reSingleDigit.test(lessonValue)) {
                cellClassList.remove("error-cell");
            } else {
                lessonValue = 0;

                cellClassList.add("error-cell");
                Animator.fadeIn(inputNode.parentElement, 400);
            }

            if (this.state.data) {
                if (lessonType in this.state.data) {
                    lessonData = this.state.data[lessonType];
                    lessonId = lessonData.id;
                }
            } else {
                this.state.data = {};
            }

            newLesson[lessonType] = {
                "id": lessonId,
                "quantity": lessonValue
            };

            Object.assign(this.state.data, newLesson);
        });

        this.setState(this.state, cb);
    }

     /**
      * Create a database entry for a new collection of lessons.
      */
    createDatabaseEntry(missingId) {
        var bodyArray = [];
        var promiseArray = [];

        for (let i = 0; i < missingId.length; i++) {
            let lessonTitle = missingId[i];
            let body = {
                quantity: 0,
                title: lessonTitle,
            };

            bodyArray.push(body);
            promiseArray.push(this.props.createComponent(body, "Lesson"));
        }

        return Promise.all(promiseArray).then((res) => {
            res.forEach((r, index)=> {
                if (Object.keys(r).length == 0) {
                    let lessonBody = bodyArray[index];

                    r = { "data": {} };

                    r.data[lessonBody.title] = 0;
                }

                var lessonData;
                var lesson = r.data;
                var lessonTitle = Object.keys(lesson)[0];

                lessonData = lesson[lessonTitle];
                Object.assign(this.state.data[lessonTitle], {
                    "id": lessonData.id
                });

                this.setState(this.state);
            });
        }).catch(error => console.error(error));
    }

    /**
     * Place the values in the Lessons object as values
     *  in the related inputs.
     */
    displayComponentState() {
        if (Object.keys(this.state).length === 0) {
            return;
        }

        // Set the value of the lesson inputs based on the related lessons quantity.
        this.lessonInputs.forEach((lessonInput) => {
            var lessonType = lessonInput.state.name;

            if (lessonType.length > 0) {
                let lessonQuantity;
                let lesson = this.state.data[lessonType];

                if (lesson) {
                    lessonQuantity = lesson.quantity;
                } else {
                    lessonQuantity = 0;
                }

                if (lessonQuantity > 0) {
                    lessonInput.setState({
                        "value": lessonQuantity
                    });
                } else {
                    lessonInput.setState({});
                }
            }
        });
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
                    Lessons
                </h2>
                <SectionDescription
                    additionalData={ [
                        <div key="key-lessons-sectiondescription-0">
                            Saved!
                        </div>
                    ] }
                    anchorCallback={ (ref) => this.setComponentReference("saveButton", ref) }
                    anchorHandleClick={ this.storeLessonValues.bind(this) }
                    buttonText={ "Save Lessons" }
                    data={ [
                        "Quantify each lesson type of the set",
                        "Use numeric quantities",
                        "Automatically store lesson quantities"
                    ] }
                    title={ "Describe the lessons of the set" }
                    type={ "content" }
                />
                <Table
                    callback={ (ref) => this.setComponentReference("lessonTable", ref) }
                    dataBody={ [
                        [
                            [
                                "Starfish",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-0",
                                    "name": "Starfish",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Sea Otter",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-1",
                                    "name": "Sea Otter",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 1",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-2",
                                    "name": "Level 1",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 6",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-3",
                                    "name": "Level 6",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Basics I",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-4",
                                    "name": "Basics I",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ]
                        ],
                        [
                            [
                                "Duck",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-5",
                                    "name": "Duck",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Salamander",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-6",
                                    "name": "Salamander",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 2",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-7",
                                    "name": "Level 2",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 7",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-8",
                                    "name": "Level 7",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Basics II",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-9",
                                    "name": "Basics II",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ]
                        ],
                        [
                            [
                                "Sea Turtle",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-10",
                                    "name": "Sea Turtle",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Sunfish",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-11",
                                    "name": "Sunfish",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 3",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-12",
                                    "name": "Level 3",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 8",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-13",
                                    "name": "Level 8",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Strokes",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-14",
                                    "name": "Strokes",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ]
                        ],
                        [
                            [""],
                            [
                                "Crocodile",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-15",
                                    "name": "Crocodile",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 4",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-16",
                                    "name": "Level 4",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 9",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-17",
                                    "name": "Level 9",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [""]
                        ],
                        [
                            [
                                "Simple Set",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-18",
                                    "name": "Simple Set",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Whale",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-19",
                                    "name": "Whale",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 5",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-20",
                                    "name": "Level 5",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Level 10",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-21",
                                    "name": "Level 10",
                                    "placeholder": "#",
                                    "type": "text"
                                })
                            ],
                            [
                                "Schoolboard",
                                React.createElement(Input, {
                                    "callback": (ref) => this.setComponentReference("lessonInputs", this.lessonInputs.concat(ref)),
                                    "handleBlur": this.storeLessonValues.bind(this),
                                    "key": "key-lessons-input-22",
                                    "name": "Schoolboard",
                                    "placeholder": "#",
                                    "styleClass": "",
                                    "type": "text"
                                })
                            ]
                        ]
                    ] }
                    dataHeader={ [
                        [
                            ["Parent & Tot"],
                            ["Pre-School"],
                            ["Swim Kids"],
                            ["Swim Kids"],
                            ["Teens & Adults"]
                        ]
                    ] }
                    styleCell={ () => null }
                    styleRow={ (index) => index % 2 ? "table-even" : "table-odd" }
                    styleTable={ "pure-table" }
                />
                <Tutorial
                    buttonClass={ "pure-button content-next-button" }
                    data={ "Input the quantity of each lesson type, using digits from 1 to 9." }
                    headingClass={ "content-head" }
                    nextName={ "dynamicPrivates" }
                    step={ 2 }
                    wrapperClass={ "content-section-footer hide" }
                />
            </div>
        );
    }
}

Lessons.propTypes = {
    callback: PropTypes.func.isRequired,
    createComponent: PropTypes.func.isRequired,
    initData: PropTypes.object.isRequired,
    setChecklistQuantity: PropTypes.func.isRequired
}

export default Lessons;
