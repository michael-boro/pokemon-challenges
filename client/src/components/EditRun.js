import React, { Component } from 'react'

class EditRun extends Component {
    constructor(props) {
        super(props)
        this.state = {
            variation: '',
            user: '',
            game: '',
            pokemon: [],
            id: '',
            completed: '',
            newPokemon: '',
            newPokemonList: [],
            pokemonLi: []
        }
    }

    async componentDidMount() {
        console.log(this.props.location.state);
        await this.matchPropsToState(this.props.location.state.run);
        this.makeList(this.state.pokemon);
    }

    matchPropsToState = (run) => {
        console.log(run);
        this.setState({
            variation: run.variation,
            user: run.user,
            game: run.game,
            pokemon: run.pokemon,
            id: run._id,
            completed: run.completed
        })
    }

    makeList = (pokemon) => {
        const list = pokemon.map(poke => {
            console.log(poke)
        return <li key={poke.pokemon}>{poke.pokemon}</li>
        })
        this.setState({pokemonLi: this.state.pokemonLi.concat(list)})
    }


    handleChange = (e) => {
        console.log(e.target.type);
        if(e.target.type === "radio" || e.target.type === "select-one") {
            this.setState({
                completed: e.target.value
            })
        }
        else if (e.target.type === "text" || e.target.type === 'textarea') {
            this.setState({
                [e.target.name]: e.target.value
            })
        }
    }

    handlePokemon = async (e) => {
        e.preventDefault();
        await fetch(`https://pokeapi.co/api/v2/pokemon/${this.state.newPokemon}/`)
        .then(res => {
            if (res.status !== 200) {
                return alert('Please enter a valid pokemon')
            } else {
                const pokemon = this.state.newPokemon;
                this.setState({
                    newPokemonList: this.state.newPokemonList.concat(pokemon),
                    newPokemon: '',
                    pokemonLi: this.state.pokemonLi.concat(<li>{pokemon}</li>)
                })
            }
        })
        
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            variation: this.state.variation,
            pokemon: this.state.newPokemonList,
            _id: this.state.id,
            completed: this.state.completed
        }
        fetch('/runs/updateRun', {
            method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify(data)
        }).then(res => {
            if (res.status === 200) {
                this.props.history.push('/my-profile');
            }
            res.json();
        }).then(data => console.log(data))
    }


    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Game: </label>
                    <input type="text" value={this.state.game}   disabled></input><br></br>
                    <label>Status:</label>
                    <select onChange={this.handleChange} value={this.state.completed}>
                        <option name="completed" value="completed">Completed</option>
                        <option name="completed" value="in progress">In-Progress</option>
                        <option name="completed" value="failed">Failed</option>
                    </select><br></br>
                    <label>Name: </label>
                    <input type="text" onChange={this.handleChange} value={this.state.user} name="name" disabled></input><br></br>
                    <label>Add Pokemon</label>
                    <input type="text" value={this.state.newPokemon} onChange={this.handleChange} name="newPokemon"></input>
                    <button onClick={this.handlePokemon}>Add Pokemon</button>
                    <br></br>
                    <button>Save Run</button>
                </form>
                <br></br>
                <p>Current Pokemon</p>
                <ul>
                    {this.state.pokemonLi}
                </ul>
            </div>
        )
    }
}

export default EditRun;