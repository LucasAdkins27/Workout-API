# Workout Tracker API

This is a small REST API I built with Node.js and Express to keep track of workout sessions, like what exercise I did, how many sets and reps, how much weight, and whether I actually finished it. Right now there's no real database behind it. Everything just lives in a JavaScript array while the server is running, so if you restart the server, the data will reset.


## How to get it running
Clone the repo, then run these commands from inside the project folder:

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
Here's what each endpoint does, in plain terms:

`GET /api/workouts` grabs every workout that's currently stored and sends them all back. Returns a 200 if it works.

`GET /api/workouts/:id` grabs one specific workout by its id. Returns a 200 if it finds it, or a 404 if that id doesn't exist.

`POST /api/workouts` adds a brand new workout. You send the exercise info in the body, and the server assigns it a unique id automatically. Returns a 201 when it's created.

`PUT /api/workouts/:id` lets you update an existing workout, like changing the weight or marking it as completed. Returns a 200 if it updates fine, or a 404 if the id doesn't exist.

`DELETE /api/workouts/:id` removes a workout from the array entirely. Returns a 200 if it deletes successfully, or a 404 if there's nothing to delete.

## Middleware I added
I used `express.json()` globally so the server can actually read JSON that gets sent in request bodies. Without it, `req.body` would just be undefined.

I also wrote a small custom logger that runs before every request. It prints the timestamp, the HTTP method, and the route to the terminal, so you can watch requests come in live while the server's running.

## How I tested it
I started the server with `npm start`, then ran curl commands against it from a second terminal window. Here's everything I ran and what came back.

### Getting all the workouts

```bash
curl -i http://localhost:3000/api/workouts
```

This came back with a 200 and the one seeded workout I have in there by default, Bench Press:

```json
[{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}]
```

### Getting one workout that actually exists

```bash
curl -i http://localhost:3000/api/workouts/1
```

Also a 200, and it correctly pulled just that one workout:

```json
{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}
```

### Trying to get a workout that doesn't exist

```bash
curl -i http://localhost:3000/api/workouts/999
```

This one's supposed to fail since there's no id 999, and it did, with a proper 404:

```json
{"error":"Workout with id 999 not found"}
```

### Creating a new workout

```bash
curl -i -X POST http://localhost:3000/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":false}'
```

Got back a 201, and the server gave it id 2 automatically:

```json
{"id":2,"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":false}
```

### Updating that workout to mark it completed

```bash
curl -i -X PUT http://localhost:3000/api/workouts/2 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

200 back, and only the `completed` field changed while everything else stayed the same:

```json
{"id":2,"exercise":"Squat","sets":5,"reps":5,"weight":185,"completed":true}
```

### Deleting the original workout

```bash
curl -i -X DELETE http://localhost:3000/api/workouts/1
```

200, and it sent back the workout it just deleted as confirmation:

```json
{"message":"Deleted successfully","workout":{"id":1,"exercise":"Bench Press","sets":4,"reps":8,"weight":135,"completed":false}}
```

### Double-checking the delete actually worked

```bash
curl -i http://localhost:3000/api/workouts/1
```

Tried to get id 1 again after deleting it, and it correctly came back as a 404 since it's gone now:

```json
{"error":"Workout with id 1 not found"}
```

## What the terminal actually looked like
While I was running all those curl commands, this is what printed in the terminal where the server was running, which shows the logging middleware working the way it's supposed to:

```
Server running on http://localhost:3000
[2026-07-13T02:39:00.684Z] GET /api/workouts
[2026-07-13T02:39:00.715Z] GET /api/workouts/1
[2026-07-13T02:39:00.725Z] GET /api/workouts/999
[2026-07-13T02:39:00.746Z] POST /api/workouts
[2026-07-13T02:39:00.755Z] PUT /api/workouts/2
[2026-07-13T02:39:00.763Z] DELETE /api/workouts/1
[2026-07-13T02:39:00.771Z] GET /api/workouts/1
```

## Conclusion
Everything worked the way it should. GET, PUT, and DELETE all gave back 200s when they succeeded, POST gave back a 201 when it created something new, and any time I asked for an id that didn't exist, I got a clean 404 instead of the server crashing or hanging. The logger also printed a line for every single request, and `express.json()` correctly parsed the data I sent in through POST and PUT.