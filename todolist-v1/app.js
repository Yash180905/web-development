const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-yash:Test123@cluster0.a0wva.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
// getting Date
var today = new Date();
var option = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};
var day = today.toLocaleDateString("hi-IN", option);

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist"
});
const item2 = new Item({
  name: "hit the + button to add new item"
});
const item3 = new Item({
  name: "<--hit this to delete item "
});
const defaultItem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("all are inserated");
          res.redirect("/");
        }
        })
    } else {
      res.render("list", {
        listTitle: day,
        // listTitle:"today",
        newListItem: foundItems
      });
    }
  });
});
// app.get("/:customListName",function(req,res) {
// console.log(req.params.customListName);
// })

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create list
        const list = new List({
          name: customListName,
          items: defaultItem
        })
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
      // }
    }
  })
})



// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "work list ",
//     newListItem: workItem
//   });
// });
app.get("/about", function(req, res) {

  res.render("about");

})
app.post("/", function(req, res) {

  let itemName = req.body.newItem;
  let listName = req.body.list[1];
  // console.log(listName);
  const item = new Item({
    name: itemName
  });
  if (listName == day) {
    // console.log("if here");
    item.save();
    res.redirect("/");
  } else {
    // console.log("else here")
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if(err){
        console.log(err);
      }else{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
    })
  }

});
app.post("/delete", function(req, res) {

  const cheackedItemId = req.body.checkbox;
  const listName = req.body.listName;
  // console.log(listName);
  if (listName === day) {
    Item.deleteOne({
      _id: cheackedItemId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: cheackedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});
app.post("/work", function(req, res) {
  let workItem = req.body.newItem;
  workItem.push(workItem);
  res.redirect("/work");
})

app.listen(process.env.PORT||3000, function() {
  console.log("server started");
})
