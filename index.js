const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { MongoClient } = require("mongodb");
require('dotenv').config();


const app = express();
const port = 3000;

app.use('/public', express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const questions = []


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
const API_KEY = "mongodb+srv://arpitsahu645:arpitsahu@cluster0.vmi1ajq.mongodb.net/?retryWrites=true&w=majority";
async function insertData() {


    console.log("sdfs");

    const uri = API_KEY;



    const client = new MongoClient(uri);
    try {

        await client.connect();
        console.log('connected');

        const db = client.db('Question_Paper_Gen');
        const collection = db.collection('Question_Bank');

        const res = await collection.insertMany(questions);



        console.log("rows inserted: " + res.insertedCount);

    }
    finally {
        await client.close();
    }


}

function getRandomNumber(min, max) {

    let randomFraction = Math.random();

    let randomNumber = Math.floor(randomFraction * (max - min + 1)) + min;

    return randomNumber;
}


const m_array = new Array(5).fill(0);
const d_array = new Array(3).fill(0);

async function get_data() {
    const uri = API_KEY;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('Question_Paper_Gen');
        const collection = db.collection('Question_Bank');

        const marks_count_markswise = await collection.aggregate([
            {
                $group: {
                    _id: '$marks',
                    count: { $sum: 1 }
                }
            },

        ]).toArray();

        const marks_count_diffiwise = await collection.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            },

        ]).toArray();


        // fill arrays
        for (let i = 0; i < marks_count_markswise.length; i++) {
            m_array[marks_count_markswise[i]._id - 1] = marks_count_markswise[i].count;
        }
        for (let i = 0; i < marks_count_diffiwise.length; i++) {
            if (marks_count_diffiwise[i]._id === 'Easy')
                d_array[0] = marks_count_diffiwise[i].count;
            else if (marks_count_diffiwise[i]._id === 'Medium')
                d_array[1] = marks_count_diffiwise[i].count;
            else
                d_array[2] = marks_count_diffiwise[i].count;

        }



    }
    finally {
        await client.close();
    }
    return { m_array, d_array };
}

async function get_questions(marks_req, diffi) {

    // console.log(d_array);
    // console.log(m_array);

    const uri = API_KEY;

    let category_marks = d_array[0];
    if (diffi === 'Medium')
        category_marks = d_array[1];
    if (diffi === 'Hard')
        category_marks = d_array[2];


    const client = new MongoClient(uri);
    try {


        await client.connect();
        const db = client.db('Question_Paper_Gen');
        const collection = db.collection('Question_Bank');

        if (category_marks <= marks_req) {

            const result = await collection.find({ difficulty: diffi });
            return result;

        }
        else {

            const marks_freq = new Array(5).fill(0);

            const marks_freq_data = await collection.aggregate([
                {
                    $match: {
                        difficulty: diffi,
                    }
                },
                {
                    $group: {
                        _id: '$marks',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            for (let i = 0; i < marks_freq_data.length; i++) {
                marks_freq[marks_freq_data[i]._id - 1] = marks_freq_data[i].count;
            }

            const result = [];

            for (let i = 4; i >= 0; i--) {
                const cnt = Math.min(marks_freq[i], parseInt(marks_req / (i + 1)));

                console.log(`cnt: ${cnt} ${marks_req}`);

                if (cnt == 0)
                    continue;

                const res = await collection.aggregate([
                    {
                        $match: {
                            difficulty: diffi,
                            marks: i + 1,
                        }
                    },
                    { $sample: { size: cnt } }
                ]).toArray();

                result.push(...res);

                // console.log(res);

                marks_req -= ((i + 1) * cnt);
            }

            console.log(marks_freq);
            return result;

        }



    }
    finally {
        await client.close();
    }

}



app.post('/submitData', async (req, res) => {

    const submittedData = req.body;
    console.log('Submitted Data:', submittedData);



    const totalMarks = parseInt(req.body.totalMarks);
    const hardP = parseInt(req.body.hardP);
    const mediumP = parseInt(req.body.mediumP);
    const easyP = parseInt(req.body.easyP);


    console.log('Form submitted:');
    console.log('Total Marks ', totalMarks);
    console.log('Hard ', hardP);
    console.log('Medium ', mediumP);
    console.log('Easy ', easyP);

    if (hardP + mediumP + easyP != 100) {

        console.log(hardP + mediumP + easyP);
        const responseMessage = 'Invalid Difficulty Percentages';
        res.json({ message: responseMessage });

    }
    else {


        try {
            var easy_marks = Math.round((totalMarks * easyP) / 100.0);
            var med_marks = Math.round((totalMarks * mediumP) / 100.0);
            var hard_marks = Math.round((totalMarks * hardP) / 100.0);

            console.log(easy_marks);
            console.log(med_marks);
            console.log(hard_marks);



            await get_data();
            const result = [];
            console.log("hehe");
            const easy_questions = await get_questions(easy_marks, "Easy");
            const med_questions = await get_questions(med_marks, "Medium");
            const hard_questions = await get_questions(hard_marks, "Hard");



            console.log(`${easy_questions.length} ${med_questions.length} ${hard_questions.length}`);
            const responseMessage = 'Questio Paper Created Successfully!';
            res.json({
                message: responseMessage,
                "easy_questions": easy_questions,
                "med_questions": med_questions,
                "hard_questions": hard_questions
            });

        }
        catch (e) {
            console.log("error occured");
            console.log(e);
            res.sendStatus(500);
        }


    }
});


app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


