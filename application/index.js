const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const createStudent = require('./2_createStudent.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set('title','Certification App');

app.get('/', (req,res) => res.send('hello contract'));

app.post('/createStudent', (req, res) => {
    createStudent.execute(req.body.studentId, req.body.name,req.body.email).then ((student) => {
        console.log('Create Student Sent');
        const result = {
            status: 'success',
            message: 'New Student Req Submitted',
            student:  student
        };
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.listen(port,()=> console.log('App listening on ${port}'));
