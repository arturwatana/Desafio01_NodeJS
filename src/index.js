const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();



app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  
  const { username } = req.headers
  const user = users.find((user)=> user.username === username)

  if(!user){

    return res.status(400).send({error: 'User not found'})
  
}

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  
  const { name, username } = req.body

  const userExists = users.some((user)=> user.username === username)

  if(userExists){
    return res.status(400).json({error: "Usuário já existe"})
  } 
  const user = {
    
    id: uuidv4(),
    name,
    username,
    todos: []
    
  }
  users.push(user)

  return res.status(201).json(user)
});

app.get('/users', (req, res)=>{

  return res.status(200).json(users)

})

app.get('/todos', checksExistsUserAccount, (req, res) => {
  
  const { user } = req
  
  return res.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  // Complete aqui

  const { title, deadline } = req.body
  const { user } = req
  const toDo = {

    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(toDo)
  
  return res.status(201).json(toDo)

});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {

  const {id} = req.params
  const {title, deadline} = req.body
  const {user} = req
  const {todos} = user

  
  
  const foundedToDo = todos.find(todo=>{
     return todo.id === id
   
  })
  
  if(foundedToDo){
  foundedToDo.title = title
  foundedToDo.deadline = new Date(deadline)
  }else{

    res.status(404).json({error:'To Do Não encontrada'})
  }

  

  return res.json(foundedToDo)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {

    const {id} = req.params
    const {user} = req
    const {todos} = user
    
    const foundedToDo = todos.find(todo=>todo.id === id)

    if(foundedToDo){
      foundedToDo.done = true
    } else {

      return res.status(404).json({error:'To Do não encontrada'})
    }

    return res.json(foundedToDo)

});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {


  const {id} = req.params
  const {user} = req
  const {todos} = user

  const foundedToDo = todos.find(todo=>todo.id === id)


  if(foundedToDo){

   todos.splice(foundedToDo, 1)


   
   
  }else {

    return res.status(404).send({error: 'To DO não encontrada'})
  }

  return res.status(204).json(todos)
});

module.exports = app;