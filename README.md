[![Node.js](https://img.shields.io/badge/Node.js-6.7.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-3.10.7-green.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

[![Viewer](https://img.shields.io/badge/Viewer-v7-green.svg)](http://forge.autodesk.com/)
[![React](https://img.shields.io/badge/React-v16-blue.svg)](http://reactjs.org)
[![Redux](https://img.shields.io/badge/Redux-v4-blue.svg)](http://redux.js.org/)
[![Standard](https://img.shields.io/badge/Standard-Style-green.svg)](https://github.com/standard/standard)
[![Build](https://travis-ci.org/dukedhx/forge-rcdb.nodejs.svg?branch=master)](https://travis-ci.org/dukedhx/forge-rcdb.nodejs)

## Description

This is Forge Responsive Connected Database: A responsive React-based web application that showcases the use of Autodesk Forge Viewer and Forge web services, working in a connected environment with integrated data from multiple databases.

This sample uses Viewer v7, Babel v7, React v16, Redux v4, Bootstrap v3, jQuery v3, and Webpack v4, and serves as a reference sample for building Viewer apps with popular front end stacks like React/Bootstrap/Webpack etc. as well.

** If you are only interested in the extensions/plugins alone or would like to run this sample w/o MongoDB, see [library-javascript-viewer-extensions](https://github.com/Autodesk-Forge/library-javascript-viewer-extensions) **

![thumbnail](/thumbnail.png)

## Live Demo

[https://forge-rcdb.autodesk.io](https://forge-rcdb.autodesk.io)

## Prerequisites

To run these samples, you need your own Forge API credentials:

 * Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account
 * [Create a new App](https://developer.autodesk.com/myapps/create)
 * For this new App, you can use <b>http://localhost:3000/api/forge/callback/oauth</b> as Callback URL.
 * Take note of the <b>Client ID</b> and <b>Client Secret</b>, those are your API keys that must remain hidden
 * Install [Python ^2.7](https://www.python.org/downloads/release/python-2714/) and [NodeJS](https://nodejs.org) and make sure its version is between 8.x (LTS) to 10.x (LTS).

## Project Setup

### Download/Clone the Project

   * `git clone <ProjectURL> --single-branch`

### MongoDB database

   Install [MongoDB](https://www.mongodb.com/), start an instance locally and create a database - we recommend to follow the tutorial [here](https://docs.mongodb.com/manual/tutorial/getting-started/) for detailed instructions.

   Import the four data collections using the JSON files [here](./resources/db) to your database, we recommend to use [MongoDB Compass](https://www.mongodb.com/products/compass) or [Robo3T](https://robomongo.org/) as client tools for this task. See [here](https://docs.mongodb.com/compass/master/import-export/) and [here](https://stackoverflow.com/questions/23009146/import-a-data-base-file-json-into-robo3t-robomongo) for instructions to import data. *Note: if you use MongoDB Compass to import the data you will need to minify the JSON objects into one lines otherwise the tool wouldn't be able to parse the JSON objects correctly*

   Make sure your database collections look like below:

```
   YourDatabase
   |
   |-------------rcdb.models
   |-------------rcdb.materials
   |-------------gallery.models
   |-------------configurator.models  
```

   Once you are done, be sure to specify the connection string or in the configuration JSON file or as environment variables - see instructions in the next section for details.

   If you would like run the sample w/o setting up MongoDB, see how to run the Extension Gallery as the backend in `tips and tricks` section later.

### Environment Setup

   Fill out the configuration JSON file [here](./config) that matches your targeted environment mode (development or production).

   For the production mode you can set up the below environment variables and will pick up.

   - `RCDB_CONNECTION_STRING` // Specify the MongoDB connection string here
   - `RCDB_DBHOST` //Specify the MongoDB host name
   - `RCDB_DBNAME` //Specify the MongoDB database name, leave empty if using connection string
   - `RCDB_USER`  //Specify the MongoDB user name, leave empty if using connection string
   - `RCDB_PASS`  //Specify the MongoDB password, leave empty if using connection string
   - `RCDB_PORT`  //Specify the MongoDB host port, leave empty if using connection string

### Client and Server

   In **development**, the client is dynamically built by the
   [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) and both the backend and client needs to run in parallel in separate sessions:

   - `npm install`    *(downloads project dependencies locally)*
   - `npm run dev` or `node ./src/server/dev.js`   *(builds/runs server on the fly with or w/o monitoring code changes)*
   - Start a new CLI session and run `npm run serve`    *(builds/runs client on the fly and monitors code changes)*
   - navigate to [http://localhost:8080](http://localhost:8080)


   In **production**, the client requires a build step, so run:

   - `npm install` *(not required if you already run at previous step)*
   - `npm run build` *(builds client)*
   - `npm start` *(run the server)*
   - navigate to [http://localhost:3000](http://localhost:3000)

### References

- Model Schema:

```json
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
```

- Material Schema:

```json
    {
      "_id" : ObjectId("57ee6b26dfda94c109157449"),
      "name" : "Steel",
      "supplier" : "Autodesk",
      "currency" : "USD",
      "price" : 2.5
    }
```

An export of my database records is provided in `/resources/db`

## Cloud Deployment

It may be a bit tricky to deploy that sample in the Cloud because it requires two steps in order to be run:

 * 1/ You need to translate at least one model using your own Forge credentials, so it can be loaded by your app. In order to do that take a look at the [step-by-step tutorial](https://developer.autodesk.com/en/docs/model-derivative/v2/tutorials/prepare-file-for-viewer/) from the [Model Derivative API](https://developer.autodesk.com/en/docs/model-derivative/v2/overview/) to understand exactly what this is about.

If you want to skip that manual process you can use one of our live sample: [https://models.autodesk.io](https://models.autodesk.io). This app lets you put your credentials and translate a model on your behalf. Another option would be to deploy to heroku the [Forge boiler plate sample #5](https://github.com/Autodesk-Forge/forge-boilers.nodejs). Make sure you deploy Project #5. This set up is more straightforward since it doesn't require any Cloud database or pre-translated models. It will let you upload, translate and manage further models as well.

Once you have translated at least one model, take note of its URN, that's the base64 encoded objectId. You also need a model which has some "Material" properties to be compatible with forge-rcdb because it is expecting components with that property. You can use Engine.dwf placed in the [resource/models](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/resources/models) directory of this project.

 * 2/ You need valid credentials to a MongoDB Cloud database that holds materials and models records. I suggest [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or [Compose MongoDB](https://elements.heroku.com/addons/mongohq). With Atlas you can set up an account for free, that's way enough for running multiple samples. Creating the database, with one user, will give you the credentials you need: dbname, dbhost, user, password and dbport.
 **Important:** your database name needs to be "forge-rcdb", it is currently hardcoded in the sample, or you need to change that accordingly in the project config.

With those credentials you can use a tool such as [http://3t.io/mongochef](http://3t.io/mongochef) a mongoDB GUI which lets you easily connect remotely to the database from your machine in order to administrate it. With Mongochef you can easily import the two sample collections I placed in the [resources/db directory](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/resources/db)

Import the two collections as 'rcdb.materials' and 'rcdb.models', then edit rcdb.model to replace the URN of your custom translated Engine.dwf model from step 1/

You should be ready to deploy to heroku, providing the same Forge credentials used to translate the model and valid credentials of the database when prompted for the environment settings.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


## Tips and Tricks

> How to run the sample without the trouble of setting up MongoDB?

Run the Gallery app from the [Extension Library project](https://github.com/Autodesk-Forge/library-javascript-viewer-extensions), then start up a new CLI session and just run `npm run serve` to start the client app alone.

> Why am I getting the error "Unexpected end of input JSON" when importing the data with MongoDB Compass?

You will need to minify the JSON objects into one lines otherwise the tool wouldn't be able to parse the JSON objects correctly. Alternatively use `Robo3T` to import the data instead.

> What should I do if I get the error `Module build failed: Error: Node Sass does not yet support your current environment: OS X 64-bit with Unsupported runtime (64)` when I tried to build the front end?

Rebuild `node-ass` with the command `npm rebuild node-sass` and build to production again.

> Error: ENOENT: no such file or directory, scandir 'F:\Projects\forge-rcdb\node_modules\node-sass\vendor'

Run `node ./node_modules/node-sass/scripts/install.js`

> Various errors when building modules with 'node-gyp' on Windows

Install Python ^2.7 and the build tools with `npm install --global --production windows-build-tools`

> Starting the application in production hangs at "Cleaning Dir"?

The log output is misleading - actually it's your MongoDB Atlas Cluster taking time to pin up.

> How should I migrate from mLab to MongoDB Atlas?

See [here](https://docs.mongodb.com/guides/cloud/migrate-from-mlab/) for their official guide. Also pull the latest changes from forge-rcdb and follow the instructions to set up your connection strings.

> What connection string should I use for my MongoDB instance?

If you are using MongoDB version earlier than 3.4 (default version as this sample), use the sharded schema: `mongodb://<username>:<password>@cluster0-shard-00-00-u9dtd.mongodb.net:27017,cluster0-shard-00-01-u9dtd.mongodb.net:27017,cluster0-shard-00-02-u9dtd.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`

Otherwise go with the service schema which is much simpler: `mongodb+srv://<username>:<password>@cluster0-u9dtd.mongodb.net/test?retryWrites=true`

See [here](https://docs.mongodb.com/manual/reference/connection-string/) for details on connection string schema.

## Written by

Forge Partner Development - [http://forge.autodesk.com](http://forge.autodesk.com)
