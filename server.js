const express = require('express');
const path = require('path');
const stripHtml = require('string-strip-html');
const dayjs = require('dayjs');

const server = express();
server.use(express.json());

const users = [];
const messages = [];

server.post('/participants', (req, res) => {
    const name = stripHtml(req.body.name).result;
    if(name == '') {
        res.sendStatus(400);
    } else {
        users.push({name: name, lastStatus: Date.now()});

        messages.push({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')});
        console.log(messages);
        res.sendStatus(200);
    }
});

server.get('/messages', (req, res) => {
    if(messages.length > 100) {
        const msg = [];
        for(let i = messages.length - 1; i > messages.length - 100; i--) {
            msg.push(messages[i]);
        }
        res.send(msg);
    } else {
        res.send(messages);
    }
});

server.post('/messages', (req, res) => {
    const [ from, to, text, type ] = req.body;
    const message = {
        from: stripHtml(from).result,
        to: stripHtml(to).result,
        text: stripHtml(text).result,
        type: stripHtml(type).result,
        time: dayjs().format('HH:mm:ss')
    };

    const userFrom = users.find(user => from == user.name);

    if(from == '' || to == '' || text == '' || (type !== 'message' && type !== 'private-message') || !userFrom) {
        res.sendStatus(400);
    } else {
        messages.push(message);
    }

});

server.listen(3000);