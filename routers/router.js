const express = require('express')
const {check,validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/user_model')
const middleware_auth = require('../middleware/middleware_auth')

router.post('/registration', [
    check('email','Ошибка валидации эмейла!').isEmail(),
    check('username','Поле должно содержать более 5 и менее 14символов!').isLength({min:5,max:14}),
    check('password','Поле должно содержать более 5 и менее 14символов!').isLength({min: 5,max:14})
], async(req,res)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            console.log('Ошибка валидации!')
            return res.status(400).json({message: 'Ошибка валидации!'})
        }

        const {email,username,password} = req.body

        const candidate_email = await User.findOne({email})
        if(candidate_email){
            return res.status(400).json({message: 'Пользователь с такой почтой уже существует!'})
        }

        const candidate_username = await User.findOne({username})

        if(candidate_username){
            return res.status(400).json({message: 'Пользователь с таким именем уже существует!'})
        }
        
        const passHash = await bcrypt.hash(password,10)
        const user = await User.create({email,username,password:passHash})

        res.status(201).json({message: 'Пользователь зарегестрирован!'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Серверная ошибка!'})
    }
})

router.post('/login',async(req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: 'Неверная почта или пароль!'})
        }
        const isValid = await bcrypt.compare(password,user.password)
        if(!isValid){
            return res.status(400).json({message: 'Неверная почта или пароль!'})
        }

        const token = jwt.sign({userID: user._id},process.env.JWT_SECRET,{expiresIn:'1h'})
        res.status(200).json({message: 'Пользователь залогинен!', token: token})
    } catch (error) {
        res.status(500).json({message: 'Серверная ошибка!'})
    }
})

router.get('/profile',middleware_auth,async(req,res)=>{
    try {
        const user = await User.findById(req.user.userID).select('-password')
        if(!user){
            return res.status(404).json({message: 'Пользователь по такому айди не найден!'})
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: 'Серверная ошибка!'})
    }
})

module.exports = router