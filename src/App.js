import './App.css';
import Web3 from "web3";
import React, {Component} from 'react';
import {TODO_LIST_ADDRESS, TODO_LIST_ABI} from './config';
import TodoList from './TodoList';

class App extends Component{
  componentDidMount(){
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    this.setState({ todoList })
    console.log(todoList)

    const taskCount = await todoList.methods.getTaskIds().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount.length; i++) {
      const task = await todoList.methods.getTask(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
    console.log('tasks:', taskCount)
    console.log(this.state.tasks)
  }

  constructor(props){
    super(props)
    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true,
    }
    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  createTask(content){
    this.setState({loading: true})
    this.state.todoList.methods.createTask(content).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false})
    })
  }
  
  toggleCompleted(taskID){
    this.setState({loading: true})
    this.state.todoList.methods.toggleCompleted(taskID).send({from: this.state.account})
    .once('receipt', (receipt)=> {
      this.setState({loading: false})
    })
  }

  render() {
    return (
    <div>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              {this.state.loading 
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> 
              : <TodoList 
                tasks={this.state.tasks} 
                createTask={this.createTask} 
                toggleCompleted={this.toggleCompleted}/>
              }
            </main>
          </div>
        </div>
    </div>
  );}
}

export default App;
