import React, { Component } from 'react';

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            test: 'false',
            game: '',
            search: ''
        }
    }
    componentDidMount() {
        // console.log('heyo');
        // this.setState({
        //     test: 'true'
        // })
        console.log(this.props);
        fetch(`/games/${this.props.match.params.id}`)
        .then(res => res.json())
        .then((json) => {
            this.setState({
                game: json.name,
                search: json.gameCode
            })
        });
    }

    componentDidUpdate() {
        if (this.state.search == this.props.match.params.id) {
            return
        }
        console.log(this.props);
        fetch(`/games/${this.props.match.params.id}`)
        .then(res => res.json())
        .then((json) => {
            this.setState({
                game: json.name,
                search: json.gameCode
            })
        });
    }

    render() {
        if (this.state.game === '') {
            return (
                <div>
                    <h1>Loading...</h1>
                </div>
            )
        } else {
            return (
                <div>
                    <h1>Please enjoy Pokemon {this.state.game}</h1>
                </div>
            )
        }
        
    }
}

export default Game