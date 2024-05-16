const express = require('express') //This variable that allows us to use the express module
const app = express() //This is a variable that allows us to use express as a method. 
const MongoClient = require('mongodb').MongoClient //This variable set ups MongoDB allows us to use MongoDB in the code 
const PORT = 2121 //This is the port will be using for this app
require('dotenv').config()


let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`) //This sends a message to the console that it's connected to the Database
        db = client.db(dbName)
    })

app.set('view engine', 'ejs') //
app.use(express.static('public')) //
app.use(express.urlencoded({ extended: true })) //
app.use(express.json()) //


app.get('/',async (request, response)=>{ //The app will send a get request from the '/'(requested endpoint) and waits for a response.
    const todoItems = await db.collection('todos').find().toArray() 
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { //This method sends a post request to the server, /addTodo is the path 
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added') //
        response.redirect('/') //This refereshes the page so it can update. 
    })
    .catch(error => console.error(error)) //This code catches any error and reports it to the console. 
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete') //This sends a message to the console that the collection has been updated. 
        response.json('Marked Complete')
    })
    .catch(error => console.error(error)) //This reports any error to the console. 

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error)) //This reports any error to the console. 

})

app.delete('/deleteItem', (request, response) => { //
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted') //This sends a message to the console that the item was deleted
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error)) //This reports any error to the console. 

})

app.listen(process.env.PORT || PORT, ()=>{ //This tells the app that we want to listen for a specific port.
    console.log(`Server running on port ${PORT}`) //This sends a message to console so we know that the server is running and what port the server is running on. 
})
