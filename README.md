
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

 * 2/ You need valid credentials to a MongoDB Cloud database that holds materials and models records. I suggest [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or [Compose MongoDB](https://elements.heroku.com/addons/mongohq). With Atlas you can set up an account for free, that's way enough for running multiple samples. Creating the database, with one user, will give you the credentials you need: dbname, dbhost, user, password and dbport.
 **Important:** your database name needs to be "forge-rcdb", it is currently hardcoded in the sample, or you need to change that accordingly in the project config.

With those credentials you can use a tool such as [http://3t.io/mongochef](http://3t.io/mongochef) a mongoDB GUI which lets you easily connect remotely to the database from your machine in order to administrate it. With Mongochef you can easily import the two sample collections I placed in the [resources/db directory](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/resources/db)

Import the two collections as 'rcdb.materials' and 'rcdb.models', then edit rcdb.model to replace the URN of your custom translated Engine.dwf model from step 1/

You should be ready to deploy to heroku, providing the same Forge credentials used to translate the model and valid credentials of the database when prompted for the environment settings.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Live Demo

[https://forge-rcdb.autodesk.io](https://forge-rcdb.autodesk.io)

 ![forge-rcdb](resources/img/logos/adsk-forge.png)


## Tips and Tricks

> What should I do if I get the error `Module build failed: Error: Node Sass does not yet support your current environment: OS X 64-bit with Unsupported runtime (64)` when I tried to build the front end?

Rebuild `node-ass` with the command `npm rebuild node-sass` and build to production again.

> How should I migrate from mLab to MongoDB Atlas?

See [here](https://docs.mongodb.com/guides/cloud/migrate-from-mlab/) for their official guide. Also pull the latest changes from forge-rcdb and follow the instructions to set up your connection strings.

> What connection string should I use for my MongoDB cluster?

If you are using MongoDB version earlier than 3.4 (default version as this sample), use the sharded schema: `mongodb://<username>:<password>@cluster0-shard-00-00-u9dtd.mongodb.net:27017,cluster0-shard-00-01-u9dtd.mongodb.net:27017,cluster0-shard-00-02-u9dtd.mongodb.net:27017/<databasename>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`

Otherwise go with the service schema which is much simpler: `mongodb+srv://<username>:<password>@cluster0-u9dtd.mongodb.net/<databasename>?retryWrites=true`

See [here](https://docs.mongodb.com/manual/reference/connection-string/) for details on connection string schema.

> I have set everything up right but am still unable to connect to MongoDB Atlas?

Be sure to follow [this tutorial](https://docs.atlas.mongodb.com/security-whitelist/) to whitelist your server. Contact Forge Help if the problem persists.

Windows 10 64bit node-gyp errors solution:

Run cmd as administrator
Run npm config edit (You will get notepad editor)
Change Prefix variable to C:\Users\<User Name>\AppData\Roaming\npm

npm install -g node-gyp
npm install -g --msvs_version=2013 node-gyp rebuild

## License

[MIT License](http://opensource.org/licenses/MIT)

## Written by

Written by [Philippe Leefsma](http://twitter.com/F3lipek)

Forge Partner Development - [http://forge.autodesk.com](http://forge.autodesk.com)

## Windows 10 64bit node-gyp errors solution:

Run cmd as administrator
Run npm config edit (You will get notepad editor)
Change Prefix variable to C:\Users\<User Name>\AppData\Roaming\npm

npm install -g node-gyp
npm install -g --msvs_version=2013 node-gyp rebuild