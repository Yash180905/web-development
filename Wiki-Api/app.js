//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true });
const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("article", articleSchema);
app.route("/article")

    //! Requests Targetting All article

    .get(function (req, res) {

        Article.find({}, function (err, foundArticle) {
            if (!err) {
                res.send(foundArticle);
            } else {
                console.log(err);
            }

        });

    })
    .post(function (req, res) {
        const recivedTitle = req.body.title;
        const recivedContent = req.body.content;
        const newArticle = new Article({
            title: recivedTitle,
            content: recivedContent
        });
        newArticle.save(function (err) {
            if (!err) {
                res.send("sucessfully added a new article.");
            } else {
                console.log(err);
            }
        });
    })
    .delete(function (req, res) {

        Article.deleteMany({}, function (err) {

            if (!err) {
                res.send("sucessfully deleted all articles.");
            } else {
                res.send(err);
            }
        })
    });

//! Requests Targetting A specific article //

app.route("/article/:articleTitle")

    .get(function (req, res) {

        Article.findOne({ title: req.params.articleTitle }, function (err, foundArticle) {
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("itm not found");
            }
        });
    })

    .put(function (req, res) {

        Article.update(
            { title: req.params.articleTitle },
            {
                title: req.body.title,
                content: req.body.content
            },
            { overwrite: true },
            function (err) {
                if (!err) {
                    res.send("updated sucessfully");
                }
            }

        );
    })

    .patch(function (req, res) {

        Article.update(
            { title: req.params.articleTitle },
            { $set: req.body },
            function (err) {
                if (!err) {
                    res.send("updated sucessfully");
                }
            })
    })

    .delete(function (req, res) {

        Article.deleteOne({ title: req.params.articleTitle },
            function (err) {
                if (!err) {
                    res.send("deleted sucessfully");
                }
            });
    });

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
