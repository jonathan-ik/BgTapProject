## Project Description

​I have developed a backend project using Node.js, Express, and PostgreSQL as the database, which includes all necessary API endpoints.
​

## Endpoints Available

​

### User Signup and Login

​
User Signup - http://localhost:3000/users/ -POST METHOD
User login -http://localhost:3000/users/login -POST METHOD
​

### Operators

Complete registration - http://localhost:3000/operators/register -POST METHOD
Select Product & seed type - http://localhost:3000/operators/selectProductAndSeed -POST METHOD
​

### States and LGAs(loads the database when the server comes up)

To load the database with the states and Lgas
app.use(StatesTable);
app.use(lgaTable);

### Product And Seed type(these loads the database when the server comes up)

To load the database with product and seed types
app.use(loadProductsTable);
app.use(loadSeedTable);

​

## How to run the app

​
-Clone the repo
-Open cloned folder and run `npm install`
​

- Create a new database in postgres called `Project_1`
  -All other details for the db can be found in the .env file
  -Run `npx db-migrate up` to run the migration
  -Run `npm run start` to run the scripts and start the server.
  -Use a postman tool to interact with the endpoints. Visit any of the endpoints above with the correct request method
