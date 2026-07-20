# Workout Tracker API

This is a small REST API I built with Node.js and Express to keep track of workout sessions, like what exercise I did, how many sets and reps, how much weight, and whether I actually finished it. Right now there's no real database behind it. Everything just lives in a JavaScript array while the server is running, so if you restart the server, the data will reset.

## How to get it running
You'll need PostgreSQL installed on your machine first. Once it's installed and running, open psql and create the database and table:

```sql
CREATE DATABASE workout_tracker;

CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  exercise VARCHAR(100),
  sets INTEGER,
  reps INTEGER,
  weight INTEGER,
  completed BOOLEAN DEFAULT false
);
```

Then in `db.js`, update the password field to match whatever password you set for your own Postgres user.
After that, install dependencies and start the server like normal:

```bash
npm install
npm start
```

Once it's running, the server sits at `http://localhost:3000` and you can start hitting it with requests.


## Tech I used
Node.js and Express for the server itself, and just a plain array in memory for storage. No database yet, that'll probably come later.


## What a workout looks like
Each workout in the array is just an object like this:

```json
{
  "id": 1,
  "exercise": "Bench Press",
  "sets": 4,
  "reps": 8,
  "weight": 135,
  "completed": false
}
```

## The routes
`GET /api/workouts` runs a `SELECT * FROM workouts` and sends back everything in the table.

`GET /api/workouts/:id` runs a `SELECT` with a `WHERE id = $1` to find one specific workout. Sends back a 404 if nothing matches.

`POST /api/workouts` takes the exercise info from the request body and runs an `INSERT` to save it into the table, then sends back the row Postgres just created, including its new id.

`PUT /api/workouts/:id` looks up the existing workout first, then merges in whatever new values were sent and runs an `UPDATE` to save the changes.

`DELETE /api/workouts/:id` runs a `DELETE` to remove the row from the table for good and sends back the workout that just got deleted.

## Middleware
I kept the same two middleware pieces from before. `express.json()` is there so I can read `req.body`, and the custom logger still prints the timestamp, method, and route to the terminal for every request.

## How I tested it
I ran `npm start`, then used curl from another terminal to hit each route. After running the requests, I also checked the table directly in psql to make sure the data was actually saved in the database and not just something the API was faking.

### Getting all the workouts
```bash
curl -i http://localhost:3000/api/workouts
```

200, and this is pulling straight from the table:

```json
[{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}]
```

### Getting one workout by id

```bash
curl -i http://localhost:3000/api/workouts/1
```

200, found the right one:

```json
{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}
```

### Trying an id that doesn't exist
```bash
curl -i http://localhost:3000/api/workouts/999
```

404, since there's no row with that id in the table:

```json
{"error":"Workout with id 999 not found"}
```

### Creating a new workout
```bash
curl -i -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":false}'
```

201, and Postgres gave it id 2 on its own:

```json
{"id":2,"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":false}
```

### Updating that workout
```bash
curl -i -X PUT http://localhost:3000/api/workouts/2 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

200, only `completed` changed and everything else stayed the same:

```json
{"id":2,"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":true}
```

### Deleting a workout
```bash
curl -i -X DELETE http://localhost:3000/api/workouts/1
```

200, with the deleted row sent back:

```json
{"message":"Deleted successfully","workout":{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}}
```

### Making sure the delete actually stuck
```bash
curl -i http://localhost:3000/api/workouts/1
```

404, since it's really gone now:

```json
{"error":"Workout with id 1 not found"}
```

### Checking the table itself in psql
This is the part that actually proves the database part is working, since it's checking the data outside of the API entirely:

```bash
psql -d workout_tracker -c "SELECT * FROM workouts;"
```

```
 id | exercise | sets | reps | weight | completed
----+----------+------+------+--------+-----------
  2 | Squat    |    5 |    5 |    185 | t
```

Only the Squat row is left, and it's marked completed, which matches everything the API said along the way.

## What the terminal looked like
```
Server running on http://localhost:3000
[2026-07-19T23:39:44.268Z] GET /api/workouts
[2026-07-19T23:39:44.370Z] GET /api/workouts/1
[2026-07-19T23:39:44.387Z] GET /api/workouts/999
[2026-07-19T23:39:44.411Z] POST /api/workouts
[2026-07-19T23:39:44.452Z] PUT /api/workouts/2
[2026-07-19T23:39:44.468Z] DELETE /api/workouts/1
[2026-07-19T23:39:44.481Z] GET /api/workouts/1
```

## Conclusion
Everything still works the same way it did before from the outside, same routes, same status codes, but now the data is actually being saved in PostgreSQL instead of an array that resets every time I restart the server. I double-checked this by looking at the table directly in psql after running all the requests, and it matched exactly what the API was showing.
