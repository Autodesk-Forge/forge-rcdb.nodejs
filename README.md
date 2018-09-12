
# Forge Responsive Connected Database

[![Node.js](https://img.shields.io/badge/Node.js-4.4.3-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-2.15.1-blue.svg)](https://www.npmjs.com/)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)

## Description

This is Forge Responsive Connected Database: A responsive React-based web application that showcases the use of Autodesk Forge Viewer and Forge web services, working in a connected environment with integrated data from multiple databases.

This project is based on the cool [React Redux Starter Kit](https://github.com/davezuko/react-redux-starter-kit)


![thumbnail](/thumbnail.png)


## Prerequisites

To run these samples, you need your own Forge API credentials:

 * Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account
 * [Create a new App](https://developer.autodesk.com/myapps/create)
 * For this new App, you can use <b>http://localhost:3000/api/forge/callback/oauth</b> as Callback URL.
 * Take note of the <b>Client ID</b> and <b>Client Secret</b>, those are your API keys that must remain hidden
 * Install the latest release of [NodeJS](https://nodejs.org)
 * Clone this or download this project. It's recommended to install a git client such as [GitHub desktop](https://desktop.github.com/) or [SourceTree](https://www.sourcetreeapp.com/)
 * To clone it via command line, use the following (<b>Terminal</b> on MacOSX/Linux, <b>Git Shell</b> on Windows):

    > git clone https://github.com/Autodesk-Forge/forge-rcdb.nodejs


## Project Setup

   In **development**, the client is dynamically built by the
   [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware), so just run:

    * `npm install`    *(downloads project dependencies locally)*

    * `NODE_ENV=development HOT_RELOADING=true npm start`      *(builds client on the fly and run server)*

    * open [http://localhost:3000](http://localhost:3000) in your favorite browser


   In **production**, the client requires a build step, so run:

    * `npm install` *(not required if you already run at previous step)*

    * `npm run build-prod && NODE_ENV=production npm start` *(builds client and run server)*

    * open [http://localhost:3000](http://localhost:3000) in your favorite browser


* To see your project open your browser `http://localhost:3000`

For database configuration, refer to config/

Model Schema:

    {
      "_id" : "mongoDB Id",
      "urn" : "model URN",
      "name" : "Model name",
      "path" : "...path of local svf for dev env ...",
      "env" : "AutodeskProduction" || "Local",
      "materialCategories": ["Material"],
      "sequence" : [],
      "states" : [],
      "options" : {
      //extensions options
      },
      "thumbnail" : "... base64 encoded thumbnail ... "
    }

Material Schema:

    {
      "_id" : ObjectId("57ee6b26dfda94c109157449"),
      "name" : "Steel",
      "supplier" : "Autodesk",
      "currency" : "USD",
      "price" : 2.5
    }

An export of my database records is provided in /resources/db


## Cloud Deployment

It may be a bit tricky to deploy that sample in the Cloud because it requires two steps in order to be run:

 * 1/ You need to translate at least one model using your own Forge credentials, so it can be loaded by your app. In order to do that take a look at the [step-by-step tutorial](https://developer.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer/) from the [Model Derivative API](https://developer.autodesk.com/en/docs/model-derivative/v2/overview/) to understand exactly what this is about.

If you want to skip that manual process you can use one of our live sample: [https://models.autodesk.io](https://models.autodesk.io). This app lets you put your credentials and translate a model on your behalf. Another option would be to deploy to heroku the [Forge boiler plate sample #5](https://github.com/Autodesk-Forge/forge-boilers.nodejs). Make sure you deploy Project #5. This set up is more straightforward since it doesn't require any Cloud database or pre-translated models. It will let you upload, translate and manage further models as well.

Once you have translated at least one model, take note of its URN, that's the base64 encoded objectId. You also need a model which has some "Material" properties to be compatible with forge-rcdb because it is expecting components with that property. You can use Engine.dwf placed in the [resource/models](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/resources/models) directory of this project.

 * 2/ You need valid credentials to a mongoDB Cloud database that holds materials and models records. I suggest [https://mlab.com](https://mlab.com). You can set up an account and run a DB with 500MB storage for free, that's way enough for running multiple samples. Creating the database, with one user, will give you the credentials you need: dbname, dbhost, user, password and dbport.
 **Important:** your database name needs to be "forge-rcdb", it is currently hardcoded in the sample, or you need to change that accordingly in the project config.

With those credentials you can use a tool such as [http://3t.io/mongochef](http://3t.io/mongochef) a mongoDB GUI which lets you easily connect remotely to the database from your machine in order to administrate it. With Mongochef you can easily import the two sample collections I placed in the [resources/db directory](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/resources/db)

Import the two collections as 'rcdb.materials' and 'rcdb.models', then edit rcdb.model to replace the URN of your custom translated Engine.dwf model from step 1/

You should be ready to deploy to heroku, providing the same Forge credentials used to translate the model and valid credentials of the database when prompted for the environment settings.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Live Demo

[https://forge-rcdb.autodesk.io](https://forge-rcdb.autodesk.io)

 ![forge-rcdb](resources/img/logos/adsk-forge.png)

## License

[MIT License](http://opensource.org/licenses/MIT)

## Written by

Written by [Philippe Leefsma](http://twitter.com/F3lipek)

Forge Partner Development - [http://forge.autodesk.com](http://forge.autodesk.com)
