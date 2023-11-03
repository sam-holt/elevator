var path = require('path');
var express = require('express');
var compression = require('compression');
const cors = require('cors');

var app = express();
app.use(cors({ origin: '' }));
app.use(express.json());
app.use(compression());
app.set('port', process.env.PORT || 5173);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'), function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});

var server = app.listen(app.get('port'), function () {
    console.log('listening on port ', server.address().port);
});