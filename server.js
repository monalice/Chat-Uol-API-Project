const express = require('express');
const cors = require('cors');
const stripHtml = require('string-strip-html');
const dayjs = require('dayjs');
const { setInterval } = require('timers');

const server = express();

server.use(express.json());
server.use(cors());

const users = [];
const messages = [];

server.post('/participants', (req, res) => {
    const name = stripHtml(req.body.name).result;
    if(name == '') {
        res.sendStatus(400);
    } else {
        users.push({name: name, lastStatus: Date.now()});

        messages.push({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')});
        res.sendStatus(200);
    }
});

server.get('/participants', (req, res) => {
    res.send(users);
});

server.post('/messages', (req, res) => {
    const { from, to, text, type } = req.body;
    const message = {
        from: stripHtml(from).result,
        to: stripHtml(to).result,
        text: stripHtml(text.trim()).result,
        type: stripHtml(type).result,
        time: dayjs().format('HH:mm:ss')
    };

    const userFrom = users.find((user) => {
        return from == user.name});

    if(from == '' || to == '' || text == '' || (type !== 'message' && type !== 'private-message') || !userFrom) {
        res.sendStatus(400);
    } else {
        messages.push(message);
        res.sendStatus(200);
    }

});

server.get('/messages', (req, res) => {
    const limit = req.query.limit || 100;
    const filteredMessages = messages.slice(messages.length - limit);
    res.send(filteredMessages);
});

server.post('/status', (req, res) => {
    const { name } = req.body;
    const user = users.find((user) => {
        return name == user.name
    });

    if(!user) {
        res.sendStatus(400);
    } else {
        user.lastStatus = Date.now();
        res.sendStatus(200);
    }
});

setInterval(() => {
    users.forEach((user) => {
        if(Date.now() - user.lastStatus > 10000){
            users.splice(user);
            const exitMessage = {
                from: user.name,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status',
                time: dayjs().format('HH:mm:ss')
            };
            messages.push(exitMessage);
        }
    });

}, 15000);

server.listen(3000);