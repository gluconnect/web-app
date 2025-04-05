import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import * as crypto from "node:crypto";
import session from "express-session";
import path from "node:path";
import fs from "node:fs";

const hostname = "127.0.0.1";

const app = express();

import http from "node:http";

const server = http.createServer(app);
const port = 8008;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    saveUninitialized: true,
    resave: true,
    secret: "ogbdfoodbkfpobfskpod32332323|_+sevsdvv//?~ZZ",
  }),
);
app.use('/app', express.static(path.join(import.meta.dirname, 'web/app')));

var Users: User[] = [
  {
    id: "jack",
    name: "Jack",
    password:
      "d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1",
    readings: [
      {
        time: new Date("December 17, 1995 03:24:00"),
        value: 120.4,
        meal: "After Meal",
        comment: "",
        measure_method: "blood sample",
        extra_data: new Map(),
      },
      {
        time: new Date("December 21, 1997 02:14:03"),
        value: 110.2,
        meal: "Before Meal",
        comment: "",
        measure_method: "blood sample",
        extra_data: new Map(),
      },
    ],
    viewers: [],
    patients: [{ email: "jack2"}], // jack has a patient which is jack2
    warnings: [], // list of warnings for patients with number of readings above threshold and latest warning threshold.
    threshold: 115,
  },
  {
    id: "jack2",
    name: "Jack 2",
    password:
      "d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1",
    readings: [
      {
        time: new Date("December 17, 2003 03:24:00"),
        value: 20.4,
        meal: "After Meal",
        comment: "",
        measure_method: "blood sample",
        extra_data: new Map(),
      },
      {
        time: new Date("December 21, 1992 02:14:03"),
        value: 10.2,
        meal: "Before Meal",
        comment: "",
        measure_method: "blood sample",
        extra_data: new Map(),
      },
    ],
    viewers: [{email: "jack"}], // jack2 has a viewer which is jack
    patients: [],
    warnings: [], // list of warnings for patients with number of readings above threshold and latest warning threshold.
    threshold: 15,
  },
];
type Warning = {
  email: string,
  warnings: number,
  reading: GlucoReading,
  state?: string //TODO: state to keep track of the warning state (e.g., "new", "viewed", etc.)
}
type User = {
  name: string;
  id: string;
  password: string;
  viewers: Array<{ email: string }>;
  patients: Array<{ email: string, lastRead?: Date }>; // lastRead is optional and can be used to store the last reading time for the patient
  threshold: number;
  readings: Array<GlucoReading>;
  warnings: Array<Warning>; // list of warnings for patients with number of readings above threshold and latest warning threshold.
};
type GlucoReading = {
  time: Date;
  value: number;
  meal: "After Meal" | "Before Meal";
  comment: string;
  measure_method: "blood sample";
  extra_data: Map<string, any>;
};

//returns a GlucoReading object from the request body
function toReading(x): GlucoReading {
  let glooc: GlucoReading = {
    time: new Date(x.time),
    value: x.value||-1, // -1 will flag error
    meal: x.meal||"N/A",
    comment: x.comment||"",
    measure_method: x.measure_method||"N/A",
    extra_data: new Map(),
  };
  if(glooc.value<0)throw new Error("Invalid value");
  if (glooc.time.toString() === "Invalid Date")throw new Error("Invalid time");
  return glooc;
}

//returns a JSON object from a GlucoReading object
function serializeReading(x: GlucoReading) {
  let glooc = {
    time: x.time.toISOString(),
    value: x.value,
    meal: x.meal,
    comment: x.comment,
    measure_method: x.measure_method,
    extra_data: "",
  };
  return glooc;
}
//hashes the password using sha256
function hash(value: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
}

function notifyWarning(viewer: User, warning: Warning) {
  //TODO: notify the viewer about the warning
  console.log("Warn user "+viewer.name+" of high reading for "+warning.email);
}

//allow clients to create user accounts. Must have email and password and email must not be duplicate.
/*Possible response codes
200 - user account created
401 - user account not created (email already exists or invalid request body)
*/
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(401);
  } else {
    if (Users.some((user) => user.id === req.body.email)) {
      res.sendStatus(401);
    } else {
      Users.push({
        id: req.body.email,
        password: hash(req.body.password),
        name: req.body.name,
        viewers: [],
        patients: [],
        threshold: -1,
        readings: [],
        warnings: []
      });
      console.log("New User Created: ", req.body.email);
      res.sendStatus(200);
    }
  }
});
//return the user associated with the email and password if they exist, otherwise return null
function verifyUser(req: any /*TODO*/): User | undefined {
  if (!req.body || !req.body.email || !req.body.password) {
    return undefined;
  } else {
    let user = getUser(req.body.email);
    if (!user) return undefined;
    if (user.password === hash(req.body.password)) {
      return user;
    }
  }
}

function getUser(email: string): User | undefined {
  return Users.find(function (user) {
    return user.id === email;
  });
}

//returns user associated with the email "uemail" if it is a patient of the user associated with the email "email" and the password is correct
//otherwise return null
function verifyPatient(req: any /*TODO*/): User | undefined {
  if (!req.body || !req.body.email || !req.body.password || !req.body.uemail) {
    return undefined;
  } else {
    let user = getUser(req.body.email);
    let ouser = getUser(req.body.uemail);
    if (!user) return undefined;
    if (user.patients.some((v) => v.email === req.body.uemail)) {
      return ouser;
    }
  }
}

//returns user associated with the email "uemail" if it is a viewer of the user associated with the email "email" and the password is correct
//otherwise return null
function verifyViewer(req: any /*TODO*/): User | undefined {
  if (!req.body || !req.body.email || !req.body.password || !req.body.uemail) {
    return undefined;
  } else {
    let user = getUser(req.body.email);
    let ouser = getUser(req.body.uemail);
    if (!user) return undefined;
    if (user.viewers.some((v) => v.email === req.body.uemail)) {
      return ouser;
    }
  }
}
//function getPatient(req)
//TODO: implement sessions
app.get("/logout", function (req, res) {
  //req.session.destroy(function () {
    //console.log("User logged out");
  //});
  res.response(200);
});
//check if the provided creds are correct, if not, throw error and fail next step *use as middeware in all user account functions
function checkLogin(req, res, next) {
  /*if (req.session.user) {
    next();
  } else */
  if (verifyUser(req)) {
    next();
  } else {
    var err = new Error("Not logged in");
    next(err); // Note: skips all remaining routes that can't handle the error
  }
}

//allows user to log in, if the provided email and password are correct
/*Possible response codes
200 - user logged in
401 - user not logged in
*/
app.post("/verify", (req, res) => {
  let user: User | undefined = verifyUser(req);
  if (user) {
    // req.session.user = ree;
    console.log("User logged in: ", user.id);
    res.status(200).send(user.name);
  } else {
    console.log("User failed to log in: ", req.body.email);
    res.sendStatus(401);
  }
});

//allows user to add a reading to their account, if the user is logged in and the request body is valid
/*Possible response codes
200 - reading added
400 - invalid request body
401 - user not logged in
*/
app.post("/add_reading", checkLogin, (req, res) => {
  if (!req.body) {
    res.sendStatus(400);
  } else {
    let user = verifyUser(req);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    let reading: GlucoReading;
    try {
      reading = toReading(req.body.reading);
    } catch (e) {
      res.sendStatus(400);
      return;
    }
    user.readings.push(reading);
    if (reading.value >= user.threshold && user.threshold >= 0) {
      for (let v of user.viewers) {
        let u = getUser(v.email);
        if(!u) continue; // if viewer is not found, skip
        let existingWarning = u.warnings.find((w) => w.email === user.id);
        if (existingWarning) {
          // if warning already exists for this viewer, increment the count
          existingWarning.warnings++;
          existingWarning.reading = reading; // update the latest reading
          notifyWarning(u, existingWarning); // notify the viewer if needed
          continue;
        }
        u.warnings.push({ email: user.id, reading: reading, warnings: 1 });
        notifyWarning(u, { email: user.id, reading: reading, warnings: 1 }); // notify the viewer for the first warning
      }
    }
    res.sendStatus(200);
  }
});

function updateWarnings(patient: User, notify: boolean){
  let count = 0, latestReading: GlucoReading | null = null;
  for (let reading of patient.readings) {
    if (reading.value >= patient.threshold && patient.threshold >= 0) {
      latestReading = reading; // keep track of the latest reading
      count++;
    }
  }
  if(latestReading)for(let v of patient.viewers) {
    let viewer = getUser(v.email)!;
    let existingWarning = viewer.warnings.find((w) => w.email === patient.id);
    if (existingWarning) {
      // if warning already exists for this viewer, update the count and latest reading
      let isWorse = count>existingWarning.warnings;
      existingWarning.warnings = count;
      if(latestReading) existingWarning.reading = latestReading; // update the latest reading
      if (notify&&isWorse) notifyWarning(viewer, existingWarning); // notify the viewer if needed and worse than previous warning count
    }
    else {
      // if no warning exists, create a new one
      viewer.warnings.push({
        email: patient.id,
        warnings: count,
        reading: latestReading
      });
      if (notify) notifyWarning(viewer, viewer.warnings[viewer.warnings.length - 1]); // notify the viewer for the first warning
    }
  }else{
    // if there are no readings, clear any existing warnings for the viewer
    for(let v of patient.viewers) {
      let viewer = getUser(v.email)!;
      viewer.warnings = viewer.warnings.filter((w) => w.email !== patient.id); // remove any existing warnings for this patient
    }
  }
}

//notify viewers after a threshold change
/*Possible response codes
200 - warnings updated and viewers notified
401 - user not logged in
*/
app.post("/update_warnings", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  updateWarnings(user, true); // update warnings for the user and notify viewers
  res.sendStatus(200);
});

//returns all readings associated with the user, if the user is logged in
/*Possible response codes
200 - readings returned
401 - user not logged in
*/
app.post("/get_readings", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  if (!user.readings) user.readings = [];
  res.status(200).json(user.readings.map((i) => serializeReading(i)));
});

//clears all readings associated with the user, if the user is logged in
/*Possible response codes
200 - readings cleared
401 - user not logged in
*/
//Note: Not currently used by any client
app.post("/clear_readings", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  user.readings = [];
  res.sendStatus(200);
});

//returns all readings associated with the patient specified by the email in the request body, if the user is logged in and has authorized the patient
/*Possible response codes
200 - readings returned
401 - user not logged in
403 - user not authorized to view patient
*/
app.post("/spectate_readings", checkLogin, (req, res) => {
  let user = verifyPatient(req);
  if (!user) {
    if (verifyUser(req)) {
      //user is logged in but not authorized to view patient
      res.sendStatus(403);
      return;
    }
    res.sendStatus(401);
    return;
  }
  res.status(200).json(user.readings.map((i) => serializeReading(i)));
});

//returns all viewers associated with the user, if the user is logged in
/*Possible response codes
200 - viewers returned
401 - user not logged in
*/
app.post("/get_viewers", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let rs = user.viewers.map(function (i) {
    let n = {
      email: i.email,
      name: "",
    };
    let u = getUser(i.email);
    if (!u) return i;
    n.name = u.name;
    return n;
  });
  res.status(200).json(rs);
});

//returns all patients associated with the user, if the user is logged in
/*Possible response codes
200 - patients returned
401 - user not logged in
*/
app.post("/get_patients", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let rs = user.patients.map(function (i) {
    let n = {
      email: i.email,
      name: "",
    };
    let u = getUser(i.email);
    if (!u) return i;
    n.name = u.name;
    return n;
  });
  res.status(200).json(rs);
});

app.post("/get_warnings", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let warnings = user.warnings.map((w) => {
    let n = {
      email: w.email,
      name: "",
      threshold: -1,
      warnings: w.warnings,
      reading: serializeReading(w.reading),
    };
    let u = getUser(w.email)!;
    n.name = u.name;
    n.threshold = u.threshold; // get the threshold for the viewer
    return n;
  });
  res.status(200).json(warnings);
});

//returns the threshold associated with the user, if the user is logged in
/*Possible response codes
200 - threshold returned
401 - user not logged in
400 - invalid threshold
*/
app.post("/change_threshold", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  if (typeof req.body.threshold !== "number") {
    res.sendStatus(400);
    return;
  }
  user.threshold = req.body.threshold;
  res.status(200).send(user.threshold + "");
});

//returns the threshold associated with the user, if the user is logged in
/*Possible response codes
200 - threshold returned
401 - user not logged in
*/
app.post("/get_threshold", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  res.status(200).send(user.threshold + "");
});

//returns the threshold associated with the patient specified by the email in the request body, if the user is logged in and has authorized the patient
/*Possible response codes
200 - threshold returned
401 - user not logged in
403 - user not authorized to view patient
*/
app.post("/spectate_threshold", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let u = verifyPatient(req);
  if (!u) {
    if (verifyUser(req)) {
      //user is logged in but not authorized to view patient
      res.sendStatus(403);
      return;
    }
    res.sendStatus(401);
    return;
  }
  res.status(200).send(u.threshold.toString());
});

app.post("/spectate_last_read", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let u = verifyPatient(req);
  if (!u) {
    if (verifyUser(req)) {
      //user is logged in but not authorized to view patient
      res.sendStatus(403);
      return;
    }
    res.sendStatus(401);
    return;
  }
  let up = user.patients.find((p) => p.email === u.id)!;
  res.status(200).send(up.lastRead ? up.lastRead.toISOString() : ""); //return last reading time if it exists, otherwise return null);
});

//sets the last reading time for the patient specified by the email in the request body, if the user is logged in and has authorized the patient
/*Possible response codes
200 - last reading time set
401 - user not logged in
403 - user not authorized to view patient
400 - invalid request body (lastRead is not a valid date)
*/
app.post("/set_patient_last_read", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let u = verifyPatient(req);
  if (!u) {
    if (user) {
      //user is logged in but not authorized to view patient
      res.sendStatus(403);
      return;
    }
    res.sendStatus(401);
    return;
  }
  let up = user.patients.find((p) => p.email === u.id)!;
  try{
    up.lastRead = new Date(req.body.lastRead);
  } catch (e) {
    res.sendStatus(400); //invalid request body
    return;
  }
  //clear all warnings for this patient with last reading time before the last read time
  user.warnings = user.warnings.filter((w) => w.email !== u.id || up.lastRead!<w.reading.time); // remove any warnings associated with the patient
  res.sendStatus(200);
});

//changes name and returns the name associated with the user, if the user is logged in
/*Possible response codes
200 - name changed
401 - user not logged in
*/
app.post("/change_name", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  user.name = req.body.newname;
  res.status(200).send(req.body.newname);
});

//changes password and returns the name associated with the user, if the user is logged in
/*Possible response codes
200 - password changed
401 - user not logged in
400 - invalid password
*/
app.post("/change_password", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  if (!req.body.newpassword) {
    res.sendStatus(400);
    return;
  }
  user.password = hash(req.body.newpassword);
  res.sendStatus(200);
});

//deletes the user account and all associated readings, viewers, and patients
/*Possible response codes
200 - user deleted
401 - user not logged in
*/
app.post("/delete", (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  if (user.viewers) {
    for (var v of user.viewers) {
      //remove connected users
      let prey = getUser(v.email);
      if (!prey) continue; //if prey is not found, skip
      prey.patients = prey.patients.filter(
        (val) => val.email !== req.body.email,
      );
      prey.warnings = prey.warnings.filter((w) => w.email !== req.body.email); // remove any warnings from viewer associated with the user being deleted
    }
  }
  if (user.patients) {
    for (var v2 of user.patients) {
      //remove connected patients
      let prey = getUser(v2.email);
      if (!prey) continue; //if prey is not found, skip
      prey.viewers = prey.viewers.filter((val) => val.email !== req.body.email);
    }
  }
  Users = Users.filter(
    (val) =>
      !(
        val.id === req.body.email ||
        (req.session && req.session.user && val.id === req.session.user.id)
      ),
  );
  req.session.destroy(function () {
    console.log("User deleted: ", req.body.email);
  });
  res.sendStatus(200);
});

//connects the user "viewer/caretaker" to another user "patient/user", allowing them to view their readings and threshold
/*Possible response codes
200 - user connected
401 - user not logged in
403 - user already connected to patient or user tried to connect to themselves
404 - other user does not exist
*/
app.post("/connect_user", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let prey = getUser(req.body.uemail);
  if (!prey) {
    res.sendStatus(404); //other user does not exist
    return;
  }
  if(req.body.uemail === user.id) {
    res.sendStatus(403); //user cannot connect to themselves
    return;
  }
  if (user.viewers.some((e) => e.email === prey.id)) {
    res.sendStatus(403); //user is already connected to prey
    return;
  }
  user.viewers.push({ email: prey.id });
  prey.patients.push({ email: user.id });
  console.log("User connected: ", user.id, " to ", prey.id);
  updateWarnings(user, false); // update warnings for the newly connected patient without notifying viewers
  res.status(200).json({email: prey.id, name: prey.name});
});
app.post("/disconnect_user", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let prey = verifyViewer(req);
  if (!prey) {
    res.sendStatus(403);
    return;
  }
  console.log("User disconnected: ", user.id, " from ", prey.id);
  user.viewers = user.viewers.filter((val) => val.email !== prey.id);
  prey.patients = prey.patients.filter((val) => val.email !== user.id);
  prey.warnings = prey.warnings.filter((w) => w.email !== user.id); // remove any warnings associated with the disconnected viewer
  res.sendStatus(200);
});
app.post("/disconnect_patient", checkLogin, (req, res) => {
  let user = verifyUser(req);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  let prey = verifyPatient(req);
  if (!prey) {
    res.sendStatus(403);
    return;
  }
  console.log("User disconnected: ", user.id, " from ", prey.id);
  user.patients = user.patients.filter((val) => val.email !== prey.id);
  prey.viewers = prey.viewers.filter((val) => val.email !== user.id);
  user.warnings = user.warnings.filter((w) => w.email !== prey.id); // remove any warnings associated with the disconnected patient
  res.sendStatus(200);
});
/*app.use('/welcome', (err, req, res, next)=>{
  console.log(err)
  res.redirect('/login')
})
app.use('/delete', (err, req, res, next)=>{
  console.log(err)
  res.redirect('/login')
})
app.use('/setnum', (err, req, res, next)=>{
  console.log(err)
  res.redirect('/login')
})*/

app.get("/", (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "web/index.html"));
});
server.listen(
  port,
  "0.0.0.0",
  () => console.log(`Le serveur est listener sur porte ${port}!`),
);
