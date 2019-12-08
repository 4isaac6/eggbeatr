/**
 * FILENAME:    Connector.js
 * AUTHOR:      Isaac Streight
 * START DATE:  April 17th, 2018
 *
 * This file contains the Connector class that links the
 *  front-end & back-end  points of the application.
 * This component uses network requests to query data
 *  from the server.
 */

import React from 'react';
import PropTypes from 'prop-types';

import ComponentData from 'root/etc/defaults/ComponentData';


class Connector extends React.Component {
    constructor(props) {
        super(props);

        this.defaults = (new ComponentData).getDefaultData();

        this.state = {
            "connectionStatus": null,
            "headerId": 1
        };
    }

    setHeaderId(newId) {
        this.state = {
            "headerId": newId
        };
    }

    async pingServer() {
        try {
            const res = await fetch(this.props.serverURI);
            this.state.connectionStatus = res.ok;
            return res;
        } catch (err) {
            this.state.connectionStatus = false;
            return err;
        }
    }

    getGridArrays(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/factory', {
            headers: headers,
            method: 'POST',
            body: JSON.stringify(payload)
        }).then(res => res.json()).catch(error => {
            console.error(error);
            return [];
        });
    }

    getGridData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(JSON.stringify(this.defaults.Grids));

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatGridRes(defaultRes);

        if (populate === "default") {
            returnValue = new Promise((resolve) => resolve(defaultRes));
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/grid?headerId=' + this.state.headerId)
                .then(res => res.json())
                .then(json => this.formatGridRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    setGridData(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/grid?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatGridRes([json]))
            .catch(error => console.error(error));
    }

    updateGridData(gridId, payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/grid/' + gridId + '?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'PUT',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatGridRes([json]))
            .catch(error => console.error(error));
    }

    deleteGridData(gridId) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/grid/' + gridId + '?headerId=' + this.state.headerId, {
                method: 'DELETE'
        })
            .then(res => res.json())
            .catch(error => console.error(error));
    }

    formatGridRes(gridRes) {
        var newObject = {};

        gridRes.forEach((grid) => {
            var newId = grid.id;
            var newDuration = grid.duration;
            var newLessonTimes = grid.lessonTimes;

            newObject = {
                "data": {
                    "id": newId,
                    "duration": newDuration,
                    "lessonTimes": newLessonTimes
                }
            };
        });

        return newObject;
    }

    getHeaderData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(JSON.stringify(this.defaults.Headers));

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatHeaderRes(defaultRes);

        if (populate === "default") {
            returnValue = new Promise((resolve) => resolve(defaultRes));
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/headers')
                .then(res => res.json())
                .then(json => this.formatHeaderRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    setHeaderData(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/headers', {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatHeaderRes([json]))
            .catch(error => console.error(error));
    }

    deleteHeaderData(headerId) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/headers/' + headerId, {
                method: 'DELETE'
        })
            .then(res => res.json())
            .catch(error => console.error(error));
    }

    formatHeaderRes(headerRes) {
        var newObject = {
            "data": {
                "selectedSet": {},
                "sets": []
            }
        };

        headerRes.forEach((header, index) => {
            var newId = header.id;
            var newSetTitle = header.setTitle;
            var newHeader = {
                "id": newId,
                "setTitle": newSetTitle
            };

            if (index === 0) {
                newObject.data.selectedSet = newHeader;
            }

            newObject.data.sets.push(newHeader);
        });

        return newObject;
    }

    getInstructorData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(JSON.stringify(this.defaults.Instructors));

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatInstructorRes(defaultRes);

        if (populate === "default") {
            returnValue = new Promise((resolve) => resolve(defaultRes));
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/instructors?headerId=' + this.state.headerId)
                .then(res => res.json())
                .then(json => this.formatInstructorRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    setInstructorData(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/instructors?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatInstructorRes([json]))
            .catch(error => console.error(error));
    }

    updateInstructorData(instructorId, payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/instructors/' + instructorId + '?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'PUT',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatInstructorRes([json]))
            .catch(error => console.error(error));
    }

    deleteInstructorData(instructorId) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/instructors/' + instructorId + '?headerId=' + this.state.headerId, {
                method: 'DELETE'
        })
            .then(res => res.json())
            .catch(error => console.error(error));
    }

    formatInstructorRes(instructorRes) {
        var newObject = {
            "data": {}
        };

        instructorRes.forEach((instructor) => {
            var newId = instructor.id;
            var newInstructor = instructor.instructor;
            var newDateOfHire = instructor.dateOfHire;
            var newPrivatesOnly = instructor.privatesOnly;
            var newWsiExpiration = instructor.wsiExpiration;

            newObject.data[newInstructor] = {
                "id": newId,
                "dateOfHire": newDateOfHire,
                "privatesOnly": newPrivatesOnly,
                "wsiExpiration": newWsiExpiration
            };
        });

        return newObject;
    }

    getLessonData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(JSON.stringify(this.defaults.Lessons));

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatLessonsRes(defaultRes);

        if (populate === "default") {
            returnValue = new Promise((resolve) => resolve(defaultRes));
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/lessons?headerId=' + this.state.headerId)
                .then(res => res.json())
                .then(json => this.formatLessonsRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    setLessonData(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/lessons?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatLessonsRes([json]))
            .catch(error => console.error(error));
    }

    updateLessonData(lessonId, payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/lessons/' + lessonId + '?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'PUT',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatLessonsRes([json]))
            .catch(error => console.error(error));
    }

    deleteLessonData(lessonId) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/lessons/' + lessonId + '?headerId=' + this.state.headerId, {
                method: 'DELETE'
        })
            .then(res => res.json())
            .catch(error => console.error(error));
    }

    formatLessonsRes(lessonsRes) {
        var newObject = {
            "data": {}
        };

        lessonsRes.forEach((lesson) => {
            var newId = lesson.id;
            var newLesson = lesson.title;
            var newQuantity = lesson.quantity;

            newObject.data[newLesson] = {
                "id": newId,
                "quantity": newQuantity
            };
        });

        return newObject;
    }

    getPreferenceData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(
            JSON.stringify(this.defaults.InstructorPreferences)
        );

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatPreferenceRes(defaultRes);

        if (populate === "default") {
            returnValue = defaultRes;
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/preferences?headerId=' + this.state.headerId)
                .then(res => res.json())
                .then(json => this.formatPreferenceRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    updatePreferenceData(preferenceId, payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/preferences/' + preferenceId + '?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'PUT',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatPreferenceRes([json]))
            .catch(error => console.error(error));
    }

    formatPreferenceRes(preferenceRes) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var defaultRes = JSON.parse(
            JSON.stringify(this.defaults.InstructorPreferences)
        );

        return fetch(this.props.serverURI + '/api/instructors?headerId=' + this.state.headerId)
            .then(res => res.json()).then((instructors) => {
                var res;
                var maxId = 0;
                var newLessons = [];
                var newObject = {
                    "data": {}
                };

                if (instructors.length === 0) {
                    return newObject;
                }

                preferenceRes.forEach((preference) => {
                    var newInstructor;
                    var newInstructorObject;
                    var newId = preference.id;
                    var newLessons = preference.lessons;
                    var newInstructorId = preference.instructorId;

                    newInstructorObject = instructors.find((instructor) => {
                        return instructor.id === newInstructorId;
                    });

                    if (!newInstructorObject) {
                        return true;
                    }

                    // This covers the case where the preference ID is -1, for uninstantiated preferences components.
                    maxId = Math.max(newId, maxId);
                    newInstructor = newInstructorObject.instructor;

                    newObject.data[newInstructor] = {
                        "id": newId,
                        "instructorId": newInstructorId,
                        "lessons": newLessons
                    };
                });

                for (let i = 0; i < defaultRes.length; i++) {
                    res = defaultRes[i];
                    newLessons = newLessons.concat(res.lessons);
                }

                // Give full preferences to instructors without preferences.
                instructors.forEach((instructor) => {
                    var newInstructorId = instructor.id;
                    var instructorName = instructor.instructor;

                    if (instructorName in newObject.data) {
                        return true;
                    }

                    newObject.data[instructorName] = {
                        "id": newInstructorId,
                        "instructorId": newInstructorId,
                        "lessons": newLessons
                    };
                });

                return newObject;
            }).catch(error => console.error(error));
    }

    getPrivatesData(populate) {
        var returnValue;
        var defaultRes = JSON.parse(JSON.stringify(this.defaults.Privates));

        for (let i = 0; i < defaultRes.length; i++) {
            Object.assign(defaultRes[i], { "id": i + 1 });
        }

        defaultRes = this.formatPrivatesRes(defaultRes);

        if (populate === "default") {
            returnValue = defaultRes;
        } else if (populate === "none") {
            returnValue = new Promise((resolve) => resolve({}));
        } else if (this.state.connectionStatus) {
            returnValue = fetch(this.props.serverURI + '/api/privates?headerId=' + this.state.headerId)
                .then(res => res.json())
                .then(json => this.formatPrivatesRes(json))
                .catch(error => {
                    console.error(error);
                    return defaultRes;
                }
            );
        } else {
            // Try to retrieve data from localStorage.
            returnValue = new Promise((resolve) => resolve({}));
        }

        return returnValue;
    }

    setPrivatesData(payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/privates?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatPrivatesRes([json]))
            .catch(error => console.error(error));
    }

    updatePrivatesData(privatesId, payload) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return fetch(this.props.serverURI + '/api/privates/' + privatesId + '?headerId=' + this.state.headerId, {
                headers: headers,
                method: 'PUT',
                body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(json => this.formatPrivatesRes([json]))
            .catch(error => console.error(error));
    }

    deletePrivatesData(privatesId) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/privates/' + privatesId + '?headerId=' + this.state.headerId, {
                method: 'DELETE'
        })
            .then(res => res.json())
            .catch(error => console.error(error));
    }

    formatPrivatesRes(privatesRes) {
        if (!this.state.connectionStatus) {
            return new Promise((resolve) => resolve({}));
        }

        return fetch(this.props.serverURI + '/api/instructors?headerId=' + this.state.headerId)
            .then(res => res.json()).then((instructors) => {
                var newObject = {
                    "data": {}
                };

                if (instructors.length === 0) {
                    return newObject;
                }

                privatesRes.forEach((privateLesson) => {
                    var newInstructor;
                    var newId = privateLesson.id;
                    var newTime = privateLesson.time;
                    var newDuration = privateLesson.duration;
                    var newInstructorId = privateLesson.instructorId;

                    // Strip newTime of milliseconds & leading zero.
                    var reLeadingZero = new RegExp(/^0/);
                    var reSeconds = new RegExp(/:[0-9][0-9]$/);

                    newTime = newTime.replace(reLeadingZero, "");
                    if (newTime.split(":").length > 2) {
                        newTime = newTime.replace(reSeconds, "");
                    }

                    var newInstructorObject = instructors.find((instructor) => {
                        return instructor.id === newInstructorId;
                    });

                    if (!newInstructorObject) {
                        return true;
                    }

                    newInstructor = newInstructorObject.instructor;

                    if (newInstructor in newObject.data) {
                        newObject.data[newInstructor].push({
                            "id": newId,
                            "instructorId": newInstructorId,
                            "duration": newDuration,
                            "time": newTime
                        });
                    } else {
                        newObject.data[newInstructor] = [{
                            "id": newId,
                            "instructorId": newInstructorId,
                            "duration": newDuration,
                            "time": newTime
                        }];
                    }
                });

                return newObject;
            }).catch(error => console.error(error));
    }

    async getReleaseVersion() {
        const res = await fetch(this.props.githubURI + '/releases');
        const json = await res.json();

        var latest = json[0];
        var name = latest.name;
        var url = latest.html_url;
        var tagName = latest.tag_name;

        return {
            "data": {
                "name": name,
                "tag": tagName,
                "url": url
            }
        };
    }
}

Connector.propTypes = {
    githubURI: PropTypes.string.isRequired,
    serverURI: PropTypes.string.isRequired
}

export default Connector;
