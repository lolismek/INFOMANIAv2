// TODO: break submissions into buckets
// TODO: warning messages can fail (used by more users at once!)
// TODO: check if contest date is ok!
// TODO: req.query -> discutabil!!!
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {render} = require('ejs');
const User = require('./models/user');
const Contest = require('./models/contest');
const cookieParser = require('cookie-parser');
const { format } = require('morgan');
const url = require('url');

const app = express();

const dbURI = 'CENSORED ON GITHUB';
mongoose.set('strictQuery', true);
mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology:true})
    .then((result) => {
        console.log('connected to db');
        app.listen(3000);
    })
    .catch((err) => {
        console.log(err)
    });

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(cookieParser());

//helper functions:
async function sendToKilonova(sendData){
    let resp1 = await fetch('https://kilonova.ro/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: (new URLSearchParams({'username': 'INFOMANIA','password': 'CENSORED ON GITHUB'})).toString()
    });

    let fetchData = await resp1.json();

    let resp2 = await fetch('https://kilonova.ro/api/submissions/submit', {
        method: "POST", 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: fetchData.data
        },
        body: (new URLSearchParams(sendData)).toString()
    });

    let resp2Data = await resp2.json();
    let subId = resp2Data.data;

    return subId;

    // o sa afiseze prost, deoarece trb ca status sa fie 'finished' !!!
    // let Link = 'https://kilonova.ro/api/submissions/getByID?id=' + (subId).toString();
    // let res = await fetch(Link);
    // let Res = await res.json();

    // let score = Res.data.sub.score;

    // return score;
}

async function extreactSubmissionData(IDs){
    let ans = [];
    for(let id in IDs){
        let Link = 'https://kilonova.ro/api/submissions/getByID?id=' + IDs[id];
        let res = await fetch(Link);
        let Res = await res.json();

        let info = {
            status: Res.status,
            name: Res.data.problem.name,
            score: Res.data.sub.score
        }

        ans.push(info);
    }

    ans.reverse();

    return ans;
}

function getTime(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    return {year: year, month: month, day: date, hours: hours, minutes: minutes};
}

function extractTime(date1, date2){
    let year = date1.substr(0, 4);
    let month = date1.substr(5, 2);
    let day = date1.substr(8, 2);

    let hours = date2.substr(0, 2);
    let minutes = date2.substr(3, 2);

    return {year: year, month: month, day: day, hours: hours, minutes: minutes};
}

function cmpDates(date1, date2){
    if(parseInt(date1.year) < parseInt(date2.year)){
        return true;
    }else if(parseInt(date1.year) > parseInt(date2.year)){
        return false;
    }else{
        if(parseInt(date1.month) < parseInt(date2.month)){
            return true;
        }else if(parseInt(date1.month) > parseInt(date2.month)){
            return false;
        }else{
            if(parseInt(date1.day) < parseInt(date2.day)){
                return true;
            }else if(parseInt(date1.day) > parseInt(date2.day)){
                return false;
            }else{
                if(parseInt(date1.hours) < parseInt(date2.hours)){
                    return true;
                }else if(parseInt(date1.hours) > parseInt(date2.hours)){
                    return false;
                }else{
                    if(parseInt(date1.minutes) < parseInt(date2.minutes)){
                        return true;
                    }else if(parseInt(date1.minutes) > parseInt(date2.minutes)){
                        return false;
                    }else{
                        return true;
                    }
                }
            }
        }
    }
}

function dateInInterval(date1, datex, date2){
    return (cmpDates(date1, datex) && cmpDates(datex, date2));
}

// routes:
let generalProblem = 0;
app.get('/', (req, res) => {
    console.log(getTime());

    let warning = "";

    if(generalProblem == 1){
        generalProblem = 0;
        warning = 'You have to login first!';
    }else if(generalProblem == 2){
        generalProblem = 2;
        warning = 'Set dates do not make sens!';
    }

    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    res.render('index', {_isLoggedIn: foundHandle, _handle: handle, warningMessage: warning});
});

let problemSignUp = 0;
app.get('/signup', (req, res) => {
    let warning = '';

    if(problemSignUp == 1){
        problemSignUp = 0;
        warning = 'Passwords do not match!!!';
    }else if(problemSignUp == 2){
        problemSignUp = 0;
        warning = 'handle taken!!!';
    }

    res.render('signup', {warningMessage: warning});
});

app.post('/signup', (req, res) => {
    const handle = req.body.handle;
    const pass1 = req.body.password1;
    const pass2 = req.body.password2;

    if(pass1 != pass2){
        problemSignUp = 1;
        res.redirect('/signup');
    }

    User.find({'handle': handle})
        .then((result) => {
            if(result.length > 0){
                problemSignUp = 2;
                res.redirect('/signup');
            }else{
                const user = new User({handle: handle, rating: 0, password: pass1});
                user.save()
                    .then((result) => {
                        res.cookie('handle', handle, {maxAge: 7200000});
                        res.redirect('/');
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
        })
        .catch((err) => {
            console.log(err);
        })
});

let problemLogIn = 0;
app.get('/login', (req, res) => {
    let warning = '';
    if(problemLogIn == 1){
        problemLogIn = 0;
        warning = 'Handle does not exist or password is incorrect!';
    }

    res.render('login', {warningMessage: warning});
})

app.post('/login', (req, res) => {
    const handle = req.body.handle;
    const pass = req.body.password;

    User.find({'handle': handle, 'password': pass})
        .then((result) => {
            if(result.length == 0){
                problemLogIn = 1;
                res.redirect('/login');
            }else{
                res.cookie('handle', handle, {maxAge: 7200000});
                res.redirect('/');
            }
        })
});

app.get('/logout', (req, res) => {
    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    if(foundHandle){
        res.clearCookie('handle');
    }

    res.redirect('/');
});

app.get('/profile/:id', (req, res) => {
    const handle = req.params.id;

    User.find({'handle': handle})
        .then((result) => {
            if(result.length == 0){
                res.redirect('/');
            }else{
                res.render('profile', {userDetails: result[0]});
            }
        })
        .catch((err) => {
            console.log(err);
        })
});

app.get('/profile/submissions/:id', (req, res) => {
    const handle = req.params.id;

    User.findOne({'handle': handle})
        .then((result) => {
            // unoptimal!
            extreactSubmissionData(result.kilonovaSubmissions)
                .then((resultt) => {
                    console.log(resultt);
                    res.render('submissions', {subList: resultt});
                })
                .catch((err) => {
                    console.log(err);
                })
        })  
        .catch((err) => {
            console.log(err);
        })
})

let lastScore = -1;
app.get('/submit', (req, res) => {
    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    if(!foundHandle){
        generalProblem = 1;
        res.redirect('/');
    }

    res.render('submit', {_lastScore: lastScore});
    lastScore = -1;
}); 

app.post('/submit', (req, res) => {
    const sendData = {
        problemID: req.body.problemID,
        language: req.body.language,
        code: req.body.code
    };

    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    sendToKilonova(sendData)
        .then((result) => {
            User.findOneAndUpdate({'handle': handle}, {$push : {kilonovaSubmissions: [result]}})
                .then((result) => {

                })
                .catch((err) => {
                    console.log(err);
                })

            res.redirect('/submit');
        })
        .catch((err) => {
            console.log(err);
        });
}); 

let createContestWarning = 0;

app.get('/create-contest', (req, res) => {
    console.log(req.query);

    res.clearCookie('contest');

    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    if(!foundHandle){
        generalProblem = 1;
        res.redirect('/');
    }

    let warningMessage = "";
    if(createContestWarning == 1){
        warningMessage = "input does not make sense! try again.";
    }
    createContestWarning = 0;

    res.render('create-contest', {'warningMessage': warningMessage, '_title': '', '_description': '', '_startDate1': '',
     '_startDate2': '', '_endDate1': '', '_endDate2': '', '_problemCount': 0, problemIDs: []});
});

app.get('/create-contest-add-problems', (req, res) => {
    let arr = [];
    for(let cookie in req.cookies){
        if(cookie === 'contest'){
            arr = req.cookies[cookie].problemIDs;
            break;
        }
    }

    res.render('create-contest-add-problems', {'kilonovaIDs': arr});
})

app.post('/create-contest-add-problems', (req, res) => {
    if(req.body.action === 'Add this problem!'){
        for(let cookie in req.cookies){
            if(cookie === 'contest'){
                let data = req.cookies[cookie];
                data.problemIDs.push(req.body.problemID);
                data.problemCount++;

                res.clearCookie('contest');
                res.cookie('contest', data, {maxAge: 7200000});
            }
        }
        res.redirect('/create-contest-add-problems');
    }else if(req.body.action === 'Create this contest!'){
        let handle = '';
        for(let cookie in req.cookies){
            if(cookie === 'handle'){
                handle = req.cookies[cookie];
            }
        }

        let data;
        for(let cookie in req.cookies){
            if(cookie === 'contest'){
                data = req.cookies[cookie];
                res.clearCookie('contest');
            }
        }

        console.log(extractTime(data.startDate1, data.startDate2));

        if(!cmpDates(extractTime(data.startDate1, data.startDate2), extractTime(data.endDate1, data.endDate2)) || !cmpDates(getTime(), extractTime(data.startDate1, data.startDate2))){
            generalProblem = 2;
            res.redirect('/');
        }else{
            const contest = new Contest({editor: handle, name: data.title, description: data.description, startDate1: data.startDate1, startDate2: data.startDate2, endDate1: data.endDate1, endDate2: data.endDate2, kilonovaProblemsIDs: data.problemIDs, participants: []});
            contest.save()
                .then((result) => {
                    res.redirect('/contests');
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }
})

app.post('/create-contest', (req, res) => {
    if(req.body.action === 'Add problems!'){
        let data = {
            title: req.body.title,
            description: req.body.description,
            startDate1: req.body.startDate1,
            startDate2: req.body.startDate2,
            endDate1: req.body.endDate1,
            endDate2: req.body.endDate2,
            problemCount: 0,
            problemIDs: []
        };

        res.cookie('contest', data, {maxAge: 7200000});
        res.redirect('/create-contest-add-problems');
    }
});

app.get('/contests', (req, res) => {
    console.log(req.query);

    let warning = req.query.warning; // metoda discutabila!

    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    Contest.find()
        .then((result) => {
            let Result = result;
            Result.reverse();
            res.render('contests', {'_isLoggedIn': foundHandle, '_handle': handle, '_contests': result, '_warning': warning});
        })
        .catch((err) => {
            console.log(err);
        })
});

app.get('/contests/:id', (req, res) => {
    // console.log(getTime());

    let id = req.params.id;

    let handle = '';
    let foundHandle = false;
    for(let cookie in req.cookies){
        if(cookie === 'handle'){
            handle = req.cookies[cookie];
            foundHandle = true;
            break;
        }
    }

    Contest.findById(id)
        .then((result) => {
            if(!cmpDates(getTime(), extractTime(result.startDate1, result.startDate2))){
                res.render('contest-page', {'_isLoggedIn': foundHandle, '_handle': handle, '_data': result});
            }else{
                res.redirect(url.format({
                    pathname: '/contests',
                    query: {
                        'warning': 'Contest has not started yet!'
                    }
                }));
            }
        })
        .catch((err) => {
            console.log(err);
        })
        
});

app.use((req, res) => {
    res.status(404).render('404');
})
