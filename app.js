const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");




const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-rohan:Rohan@123@cluster0.eprat.mongodb.net/todolistdb",{useNewUrlParser: true, useUnifiedTopology: true})


const itemSchema = {
    name: String
}

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your ToDo List"
})

const item2 = new Item({
    name: "Hit the + button to add a new task"
})

const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

const item4 = new Item({
    name: "Type /{listname} in address bar to make a new list"
})

const defaultItems = [item1,item2,item3,item4];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = new mongoose.model("List",listSchema);




let today = new Date();
    
let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
}

let day = today.toLocaleDateString("en-IN",options);

app.get("/",function(req,res){


    Item.find({}, function(err,founditems){

        if(founditems.length === 0){
            
            Item.insertMany(defaultItems , function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Saved default items to the database")
                }
            });

            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: day, newListItems: founditems});
        }

    })
    
})

app.get("/:customListName",function(req,res){
    
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err,foundList){

        if(!err){
            if(!foundList){

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect("/" + customListName);
            }
            else{

                
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
 
});


app.post("/",function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.button;

    const item = new Item({
        name: itemName
    });

    if(listName === day){
        item.save();

        res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err,foundList){

            if(!err){
                foundList.items.push(item);
                foundList.save();
                
                res.redirect("/"+listName);
            }
        })
    }
   

})


app.post("/delete",function(req,res){

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId, function(err){

            if(!err){
                res.redirect("/");
            }
    
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull : {items:{_id: checkedItemId} } },function(err,foundList){

            if(!err){
                res.redirect("/"+listName);

            }
        })

    }

    
   

})
app.listen(process.env.PORT || 3000,function(){
    console.log("Server started on port 3000")
})