/**
 * FILENAME:    Header.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 18th, 2016
 *
 * This file contains the Header class for the header
 *  content of the lesson calendar web application.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Input from 'utils/Input';
import Anchor from 'utils/Anchor';
import Animator from 'functions/Animator';
import SetList from 'specializations/SetList';
import UnorderedList from 'utils/UnorderedList';
import EditButton from 'specializations/EditButton';
import ServerStatus from 'helpers/ServerStatus';
import WaitIndicator from 'helpers/WaitIndicator';
import ScrollingAnchor from 'specializations/ScrollingAnchor';


class Header extends React.Component {
    constructor(props) {
        super(props);

        var sorted = this.sortSets(props.initData);

        Object.assign(sorted.data, {
            "versionName": ""
        });

        this.state = sorted;
    }

    componentDidMount() {
        this.finishEditing();
        this.props.callback(this.state, "header", false);
    }

    /**
     * Places the header in a state where the sets
     *  can be changed.
     */
    edit() {
        var setList = ReactDOM.findDOMNode(this.setList);
        var anchorClass = this.setInputAnchor.state.styleClass;
        var reCellStyles = new RegExp(/(\serror-cell)|(\swarning-cell)/, "g");

        this.editButton.setState({
            "handleClick": this.finishEditing.bind(this),
            "mode": "edit"
        });

        this.setInputAnchor.setState({
            "styleClass": anchorClass.replace(reCellStyles, "")
        });

        this.setInputField.setState({
            "data": "",
            "handleBlur": this.addSet.bind(this),
            "styleClass": "is-visible"
        });

        this.setList.setState({
            "handleClick": this.removeSet.bind(this),
            "mode": "edit",
        });

        setList.style = "width:24%";
    }

    /**
     * Places the header in a state where the sets
     *  cannot be changed.
     */
    finishEditing() {
        var setList = ReactDOM.findDOMNode(this.setList);
        var anchorClass = this.setInputAnchor.state.styleClass;
        var reCellStyles = new RegExp(/(\serror-cell)|(\swarning-cell)/, "g");

        this.editButton.setState({
            "handleClick": this.edit.bind(this),
            "mode": "default"
        });

        this.setInputAnchor.setState({
            "styleClass": anchorClass.replace(reCellStyles, "")
        });

        this.setInputField.setState({
            "handleBlur": () => null,
            "styleClass": "is-invisible"
        });

        this.setList.setState({
            "handleClick": this.selectSet.bind(this),
            "mode": "default"
        });

        setList.style = "width:28%";
    }

    /**
     * Returns the title to the currently selected set.
     */
    getSelectedSet() {
        return this.state.data.selectedSet.setTitle;
    }

    /**
     * Sets the selected set in each component.
     * If the set is not in component's object,
     *  add empty object.
     */
    selectSet(setTitle) {
        var sets = this.state.data.sets;
        var selectedSet = sets.find((set) => set.setTitle === setTitle);

        Object.assign(this.state.data, {
            "selectedSet": selectedSet
        });
        this.setState(this.state, () => this.finishEditing());

        var time = Date.parse(new Date());
        this.waitIndicator.setState({
            "indicatorStyleClass": "is-visible"
        });

        this.props.callback(this.state, "header", true).then(() => {
            // Delay the loading indicator to improve readablility.
            setTimeout(
                () => this.waitIndicator.setState({
                    "indicatorStyleClass": "is-invisible"
                }),
                Date.now() - time + 1000
            );
        });
    }

    /**
     * Add a new Set to the list.
     */
    addSet() {
        var body;
        var isValid;
        var sets = this.state.data.sets;
        var newSetName = this.setInputField.state.data;

        body = {
            "setTitle": newSetName
        };

        isValid = this.validateSet(newSetName);

        if (!isValid) {
            return;
        }

        this.setInputField.setState({
            "data": ""
        });

        this.props.createComponent(body, "Header")
            .then((res) => {
                var newSets = sets.concat(res.data.selectedSet);

                this.updateSets(newSets, newSetName);
            });
    }

    /**
     * Make sure the new Set name is valid.
     */
    validateSet(newSetName, sets) {
        var isValid = true;
        var sets = this.state.data.sets;
        var reSetName = new RegExp(/^[A-Za-z0-9]+$/);
        var anchorClass = this.setInputAnchor.state.styleClass;
        var inputAnchor = ReactDOM.findDOMNode(this.setInputAnchor);
        var isIncluded = sets.find((set) => set.setTitle === newSetName);
        var reCellStyles = new RegExp(/(\serror-cell)|(\swarning-cell)/, "g");

        anchorClass = anchorClass.replace(reCellStyles, "");

        if (sets.length > 8 || isIncluded || !reSetName.test(newSetName)) {
            if (newSetName.length > 0) {
                if (sets.length > 8) {
                    anchorClass = anchorClass.concat(" warning-cell");
                } else {
                    anchorClass = anchorClass.concat(" error-cell");
                }

                Animator.fadeIn(inputAnchor, 800);
            }

            this.editButton.setState({
                "handleClick": this.finishEditing.bind(this)
            });

            isValid = false;
        }

        this.setInputAnchor.setState({
            "styleClass": anchorClass
        });

        return isValid;
    }

    /**
     * Remove a Set.
     */
    removeSet(setTitle) {
        var id;
        var sets = this.state.data.sets;
        var deletedSet = sets.find((set) => set.setTitle === setTitle);

        id = deletedSet.id;

        this.props.removeComponent(id, "Header")
            .then(() => {
                var newSets = sets.filter((set) => set !== deletedSet);

                this.updateSets(newSets, deletedSet.setTitle);
            });
    }

    /**
     * Update the list of Sets.
     */
    updateSets(newSets, selectedSet) {
        // Scroll to end of list when adding list out of visible range.
        this.fitSetList(selectedSet);

        Object.assign(this.state.data, { "sets": newSets });
        this.setState(this.state, () => {
            this.edit();
        });
     }

    /**
     * Disable the click handler for the Edit button
     *  to prevent clash with adding Sets.
     */
    disableEditButton() {
        this.editButton.setState({
            "handleClick": () => null
        });
    }

    /**
     * Scroll the list of Sets to fit the unordered list in the display window.
     */
    fitSetList(setName) {
        var initial;
        var maxWidth;
        var viewWidth;
        var setList = ReactDOM.findDOMNode(this.setList);

        initial = setList.scrollLeft;
        maxWidth = setList.scrollWidth;
        viewWidth = setList.clientWidth;

        Animator.slide(800, (progress) => {
            setList.scrollTo(initial + progress * (maxWidth - viewWidth + 16 * (setName.length + 1)), 0);
        });
    }

    /**
     * Sort the header set objects by setTitle.
     */
    sortSets(newState) {
        var newSets = [];
        var newSelectedSet = newState.data.selectedSet;

        Object.keys(newState.data.sets).sort().forEach((key) => {
            newSets.push(newState.data.sets[key]);
        });

        return {
            "data": {
                "selectedSet": newSelectedSet,
                "sets": newSets
            }
        };
    }

    /**
     * Set the reference to subcomponent references.
     */
    setComponentReference(name, reference) {
        this[name] = reference;
    }

    render() {
        return (
            <div className="home-menu pure-menu pure-menu-horizontal pure-menu-fixed">
                <ScrollingAnchor
                    data={ this.state.data.versionName }
                    styleClass={ "pure-menu-heading" }
                />
                <ServerStatus
                    callback={ (ref) => this.setComponentReference("serverStatus", ref) }
                    status={ this.props.serverStatus }
                />
                <Anchor
                    data={ "SET" }
                    handleClick={ () => null }
                    styleClass={ "pure-menu-heading" }
                />
                <div className="pure-menu pure-menu-horizontal pure-menu-scrollable">
                    <SetList
                        callback={ (ref) => this.setComponentReference("setList", ref) }
                        data={ this.state.data }
                    />
                </div>
                <Anchor
                    callback={ (ref) => this.setComponentReference("setInputAnchor", ref) }
                    data={ [
                        React.createElement(Input, {
                            "callback": (ref) => this.setComponentReference("setInputField", ref),
                            "handleBlur": this.disableEditButton.bind(this),
                            "key": "key-header-input-0",
                            "placeholder": "...",
                            "styleClass": "is-invisible",
                            "type": "text"
                        })
                    ] }
                    handleClick={ () => null }
                    styleClass={ "header-input" }
                />
                <WaitIndicator
                    callback={ (ref) => this.setComponentReference("waitIndicator", ref) }
                    data={ "Loading..." }
                />
                <EditButton
                    callback={ (ref) => this.setComponentReference("editButton", ref) }
                    handleClick={ () => null }
                />
                <UnorderedList
                    data={ [
                        {
                            "data": [
                                React.createElement(ScrollingAnchor, {
                                    "data": "About",
                                    "key": "key-header-li-scroll-0"
                                })
                            ],
                            "styleClass": "pure-menu-item"
                        },
                        {
                            "data": [
                                React.createElement(ScrollingAnchor, {
                                    "data": "Instructors",
                                    "key": "key-header-li-scroll-1"
                                })
                            ],
                            "styleClass": "pure-menu-item"
                        },
                        {
                            "data": [
                                React.createElement(ScrollingAnchor, {
                                    "data": "Lessons",
                                    "key": "key-header-li-scroll-2"
                                })
                            ],
                            "styleClass": "pure-menu-item"
                        },
                        {
                            "data": [
                                React.createElement(ScrollingAnchor, {
                                    "data": "Privates",
                                    "key": "key-header-li-scroll-3"
                                })
                            ],
                            "styleClass": "pure-menu-item"
                        },
                        {
                            "data": [
                                React.createElement(ScrollingAnchor, {
                                    "data": "Grid",
                                    "key": "key-header-li-scroll-4"
                                })
                            ],
                            "styleClass": "pure-menu-item"
                        }
                    ] }
                />
            </div>
        );
    }
}

Header.propTypes = {
    callback: PropTypes.func.isRequired,
    createComponent: PropTypes.func.isRequired,
    initData: PropTypes.object.isRequired,
    removeComponent: PropTypes.func.isRequired,
    serverStatus: PropTypes.bool.isRequired
}

export default Header;
