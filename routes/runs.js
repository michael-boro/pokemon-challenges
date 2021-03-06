const express = require('express');
const Run = require('../models/Runs');
const Game = require('../models/Game');
const mongoose = require('mongoose');

const withAuth = require('../middleware/middleware');

const router = express.Router();


//Fetching Routes
router.get('/all', async (req, res) => {
    const runs = await Run.find({}).sort('-_id');
    res.send(runs);
})

router.get('/view/:id', async (req, res) => {
    try {
        const run = await Run.findById(req.params.id);
        res.status(200).send(run)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/runPokemon/:runId/:pokemonId', async (req, res) => {
    const run = await Run.findById(req.params.runId);
    const pokemon = await run.pokemon.filter(poke => {
        return poke._id == req.params.pokemonId
    })
    res.send({ pokemon });
})

router.get('/:game/all', async (req, res) => {
    const games = await Run.find({ game: req.params.game });
    res.send(games);
})


router.get('/:username', async (req, res) => {
    const runs = await Run.find({ user: { $regex: new RegExp("^" + req.params.username + "$", "i") } }).sort('-_id');
    res.send(runs);
})



// Adding Routes
router.post('/newRun', withAuth, async (req, res) => {
    const run = new Run(req.body);
    try {
        await run.save();
        const game = await Game.findOne({ gameCode: req.body.game });
        game.runs++;
        await game.save();
        res.status(201).send(run);
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

//Add a new comment to a run
router.post('/newComment', withAuth, async (req, res) => {
    try {
        const run = await Run.findById(req.body.runId);
        await run.comments.push({ user: req.body.username, message: req.body.message, posted: req.body.posted })
        await run.save();
        res.send(run)
    } catch (e) {
        console.log(e);
        res.send(e);
    }

})

//Delete a comment on a run
router.delete('/deleteComment', withAuth, async (req, res) => {
    const run = await Run.findById(req.body.runId);
    const newComments = await run.comments.filter(com => {
        return com._id != req.body.commentId
    });
    run.comments = newComments;
    try {
        await run.save();
        res.status(201).send(run);
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

//Add a Pokemon
router.post('/addPokemon/:runId', withAuth, async (req, res) => {
    const run = await Run.findOne({ _id: req.params.runId });
    if (!run) {
        res.status(404).send({ error: 'could not locate run' })
    }
    const newPoke = {
        pokemon: req.body.pokemon,
        starter: req.body.starter,
        nickname: req.body.nickname,
        status: req.body.status
    }
    try {
        if (newPoke.starter === true) {
            run.pokemon.forEach(poke => {
                poke.starter = false
            })
        }
        run.pokemon.push(newPoke);
        await run.save();
        res.status(201).send(run)
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }

})

//Deleting Routes
router.delete('/delete', withAuth, async (req, res) => {
    const run = await Run.findByIdAndDelete(req.body.id);
    if (!run) {
        res.status(500).send();
    } else {
        const game = await Game.findOne({ gameCode: run.game });
        game.runs--;
        await game.save();
        res.status(200).send(run);
    }
})


//Delete a Pokemon
router.delete('/:run/pokemon/:poke', withAuth, async (req, res) => {
    const run = await Run.findById(req.params.run);
    console.log(run);
    const newRun = await run.pokemon.filter(poke => {
        return poke._id != req.params.poke
    });
    run.pokemon = newRun;
    try {
        await run.save();
        res.send(run);
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})


//Update a Pokemon
router.patch('/editPokemon/:runId/:pokeId', withAuth, async (req, res) => {
    const allowedUpdates = ['pokemon', 'starter', 'nickname', 'status', '_id'];
    const run = await Run.findOne({ _id: req.params.runId });
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation || !run) {
        return res.status(400).send('unable to process update')
    }

    if (req.body.starter === true) {
        run.pokemon.forEach(poke => {
            poke.starter = false
        })
    }

    run.pokemon.forEach(poke => {
        if (poke._id == req.params.pokeId) {
            poke.pokemon = req.body.pokemon,
                poke.starter = req.body.starter,
                poke.status = req.body.status,
                poke.nickname = req.body.nickname
        } else {
            return
        }
    })
    await run.save();
    res.status(201).send({ run })
})



//Updating Routes
router.patch('/updateRun', withAuth, async (req, res) => {
    const allowedUpdates = ['completed', 'pokemon', 'variation', '_id', 'runNotes', 'randomized'];
    const run = await Run.findOne({ _id: req.body._id });
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send('unable to process update')
    }

    try {
        updates.forEach((update) => {
            if (update == 'pokemon') {
                req.body[update].forEach(pkmn => run.pokemon.push({ pokemon: pkmn }))
            } else {
                run[update] = req.body[update]
            }

        });
        await run.save();
        console.log(run);
        res.status(200).send(run)
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})



module.exports = router;