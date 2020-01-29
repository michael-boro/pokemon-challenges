import React, { Component } from 'react'

export default class EditPokemon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            species: '',
            starter: false,
            starterValue: this.starter ? 'yes' : 'no',
            nickname: ''
        }
    }

    async componentDidMount() {
        await fetch(`/runs/runPokemon/${this.props.match.params.runId}/${this.props.match.params.pokemonId}`)
        .then(res => res.json())
        .then(data => {
            console.log(data.pokemon[0]);
            this.setState({
                species: data.pokemon[0].pokemon,
                starter: data.pokemon[0].starter,
                nickname: data.pokemon[0].nickname || data.pokemon[0].pokemon,
                status: data.pokemon[0].status || 'fainted'
            })
        })
    }

    deletePokemon = () => {
        fetch(`/runs/${this.props.match.params.runId}/pokemon/${this.props.match.params.pokemonId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            console.log(res);
            if (res.status === 200) {
                console.log('deleted');
                this.props.history.push(`/edit-run/${this.props.match.params.runId}`);
            } else {
                console.log("error deleting")
            }
        })
    }

    handleChange = (e) => {
        if (e.target.name === "starter") {
            const text = e.target.name;
            this.setState({
                [text]: e.target.value === "yes" ? true : false,
                starterValue: e.target.value === "yes" ? "yes" : "no"
            })
        } else if (e.target.type === "text" || e.target.type === "select-one") {
            const text = e.target.name;
            this.setState({
                [text]: e.target.value
            })
        } 
        
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const update = {
            pokemon: this.state.species,
            starter: this.state.starter,
            nickname: this.state.nickname === '' ? this.state.species : this.state.nickname,
            status: this.state.status,
            _id: this.props.match.params.pokemonId
        }
        //Checks to make sure it is a valid pokemon
        await fetch(`https://pokeapi.co/api/v2/pokemon/${update.pokemon}/`)
        .then(async res => {
            if (res.status !== 200) {
                return console.log('invalid pokemon')
            }
            await fetch(`/runs/editPokemon/${this.props.match.params.runId}/${this.props.match.params.pokemonId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                body: JSON.stringify(update)

            })
            .then(res => {
                if (res.status === 201) {
                    this.props.history.push(`/edit-run/${this.props.match.params.runId}`);
                } else {
                    alert('an error occured while updating')
                }
            })
        })
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit} className="editRunForm">
                    <label>Species</label>
                    <input type="text" value={this.state.species} name="species" onChange={this.handleChange} />
                    <label>Nickname</label>
                    <input type="text" value={this.state.nickname} name="nickname" onChange={this.handleChange} />
                    <label>Starter?</label>
                    <select onChange={this.handleChange} value={this.state.starterValue} name="starter">
                        <option name="starter" value="yes">Yes</option>
                        <option name="starter" value="no">No</option>
                    </select>
                    <label>Status</label>
                    <select onChange={this.handleChange} value={this.state.status} name="status">
                        <option name="status" value="alive">Alive</option>
                        <option name="status" value="fainted">Fainted</option>
                    </select>
                    <button className="save">Save</button>
                </form>
                <button className="delete" onClick={this.deletePokemon}>DELETE POKEMON</button>
            </div>
        )
    }
}