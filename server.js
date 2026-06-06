const express = require("express")
const app = express()
PORT = 3000
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt")
const session = require("express-session")
const dotenv = require("dotenv")
dotenv.config()

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

const checkAuth = (req, res, next) => {
    if(req.session && req.session.isLoggedIn){
        return next()
    }else{
        return res.status(401).json({
            message: "you must login"
        })
    }
}

user_accounts = JSON.parse(
    fs.readFileSync("./data/user_account.json", "utf-8")
)
function saveUserAccounts(){
    fs.writeFileSync(
        "./data/user_account.json",
        JSON.stringify(user_accounts, null, 2)
    )
}

app.get("/", (req, res) => {
    res.render("choose-sign", {logout: false})
})

app.get("/notes", checkAuth, (req, res) => {
    res.render("notes", {username: req.session.username})
})

app.get("/sign-in", (req, res) => {
    res.render("signin-login", {choose: "sign-in"})
})

app.get("/login", (req, res) => {
    res.render("signin-login", {choose: "login"})
})

app.post("/sign-in", async (req, res) => {
    const {username, password} = req.body
    const user = user_accounts.find(user => user.username === username)
    if(user){
        res.json({
            message: "username is had"
        })
    }else{
        const hashPassword = await bcrypt.hash(password, 10)
        user_accounts.push({
            username,
            password: hashPassword
        })
        saveUserAccounts()
        res.json({
            message: "Success sign in"
        })
    }
})

app.post("/login", async (req, res) => {
    const {username, password} = req.body
    // asdasdasd123
    const user = user_accounts.find(user => user.username === username)
    if(user){
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch){
            req.session.isLoggedIn = true
            req.session.username = user.username

            // res.redirect("/notes")
            res.json({
                message: "Success login"
            })
        }else{
            res.json({
                message: "Password Not Wrong"
            })
        }
    }else{
        res.json({
            message: "Username Wrong"
        })
    }
})

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.render("choose-sign", {logout: true})
    })
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
