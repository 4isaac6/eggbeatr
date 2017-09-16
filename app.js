/**
 * FILENAME:    app.js
 * AUTHOR:      Isaac Streight
 * START DATE:  October 18th, 2016
 *
 * This file is the entry point for the lesson calendar web application.
 *
 *
 * CHANGE LOG:
 *  18/10/16:
 *              Added imports from React, ReactDOM, PureCSS, style.css, and
 *              the Header & About components.
 *              Rendered the Header and About components to statically
 *              defined div tags in index.html.
 *
 *  19/10/16:
 *              Added Landing class import and render to 'dynamicLanding'.
 *              Added Grid class to import and render to 'dynamicGrid'.
 *
 *  25/10/16:
 *              Added Instructors class import and render to 'dynamicInstructors'.
 *
 *  01/11/16:
 *              Added Private class import and render to 'dynamicPrivate'.
 *
 *  02/11/16:
 *              Added Lessons class import and render to 'dynamicLessons'.
 */


// Libs
import React from 'react';
import ReactDOM from 'react-dom';

// CSS
import { buttons, grids } from 'pure-css';
import './css/style.css';

// Components
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import LIPReader from './components/LIPReader';
import Grid from './components/Grid';
import GridChecklist from './components/GridChecklist';
import Footer from './components/Footer';

var lipReader;
var gridChecklist;

// Render components to static div tags.
ReactDOM.render(<Header />, document.getElementById('dynamicHeader'));
ReactDOM.render(<Landing />, document.getElementById('dynamicLanding'));
ReactDOM.render(<About />, document.getElementById('dynamicAbout'));

lipReader = new LIPReader();

ReactDOM.render(<Grid
    lipData={lipReader.manipulateData()}
/>, document.getElementById('dynamicGrid'));

// Create a single GridChecklist for components to reference.
gridChecklist = (new GridChecklist()).renderComponent();

// renderComponents renders Lessons, Instructors, and Private to static div tags.
lipReader.renderComponents(gridChecklist);

ReactDOM.render(<Footer />, document.getElementById('dynamicFooter'));