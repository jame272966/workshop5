const jwt = require('jsonwebtoken')

module.exports = (req,res, next) => {
    try{

        let token = req.header.authorization
        if (!token) return res.status(401).send('invail token.')
        req.auth = token
        next()

    } catch (error){
        res.status(500).send(error)
    }
}