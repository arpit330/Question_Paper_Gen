
document.addEventListener('DOMContentLoaded', function () {

    const dataForm = document.getElementById("data_form");
    const totalMarks_ele = document.getElementById("totalMarks");
    const hardP_ele = document.getElementById("hardP");
    const mediumP_ele = document.getElementById("mediumP");
    const easyP_ele = document.getElementById("easyP");



    dataForm.addEventListener("submit", e => {
        e.preventDefault();
        console.log("hehe");
        const totalMarks = totalMarks_ele.value;
        const hardP = hardP_ele.value;
        const mediumP = mediumP_ele.value;
        const easyP = easyP_ele.value;


        // const message = inputMessage.value;
        console.log(`${totalMarks} ${hardP} ${mediumP} ${easyP}`);


        fetch('http://127.0.0.1:3000/submitData', {
            method: 'POST',
            body: JSON.stringify({
                "totalMarks": totalMarks,
                "hardP": hardP,
                "mediumP": mediumP,
                "easyP": easyP,
            }),
            headers: {
                'Content-Type': "application/json; charset=UTF-8",
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // document.getElementById('result').innerHTML = `<p>${data.message}</p>`;

                const result_ele = document.getElementById('result');
                result_ele.removeChild(result_ele.firstChild);

                if (data.message[0] === 'i') {
                    const err_message = document.createElement('div');
                    err_message.textContent = data.message;
                    result_ele.append(err_message);
                }
                else {
                   

                    const question_list = document.createElement('div');
                    const lineBreak = document.createElement('br');
                    // console.log(data.easy_question);
                    // const diffi_tag

                    for (let i = 0; i < data.easy_questions.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = data.easy_questions[i].question + ` (${data.easy_questions[i].marks}) `;
                        question_list.appendChild(listItem);
                    }

                    for (let i = 0; i < data.med_questions.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = data.med_questions[i].question + ` (${data.med_questions[i].marks}) `;
                        question_list.appendChild(listItem);
                    }

                    for (let i = 0; i < data.hard_questions.length; i++) {
                        const listItem = document.createElement('li');
                        listItem.textContent = data.hard_questions[i].question + ` (${data.hard_questions[i].marks}) `;
                        question_list.appendChild(listItem);
                    }
                    result_ele.append(question_list);
                }

            })
            .catch(error => console.error('Error:', error));


        // inputMessage.value = "";
    });



});
fetch('http://127.0.0.1:3000/getData')
    .then(response => response.json())
    .then(data => {
        // document.getElementById('result').innerHTML = `<p>${data.message}</p>`;
        console.log(data);
    })
    .catch(error => console.error('Error:', error));