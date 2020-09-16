# List of Steps to get going

1. Make sure your .env file has the right things in it!
1. `npm install` of all dependencies
   - express, cors, superagent, pg, dotenv
1. Create the database
   - If you haven't done it...
     - `psql`
     - `CREATE DATABASE somedatabasename;`
1. Create Tables from a schema file, assuming you have one
   - `psql somedatabasename -f ./schema.sql`

## Server Stuff

1. Bring in the dependencies
1. Initialize app helpers
   - express (app)
   - pg.Client()
1. Connect to pg (client.connect())
1. Start the express app (app.listen())
1. Setup your routes to do your work
