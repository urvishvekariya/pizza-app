const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { sendWelcomeEmail, sendResetiLnk } = require('../../emails/account')
const jwt = require('jsonwebtoken')

function authControler() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders'
    }

    return {
        login(req, res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {
            const { email, password } = req.body
            //validate request
            if (!email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('email', email)
                return res.redirect('/login')
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.login(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }

                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },
        register(req, res) {
            res.render('auth/register')
        },
        async postRegister(req, res) {
            const { name, email, password } = req.body
            //validate request
            if (!name || !email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            //email exist 
            User.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })

            //hash password 
            const hashedPassword = await bcrypt.hash(password, 10)
            //create a user account
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((r) => {
                sendWelcomeEmail(r.email, r.name)
                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong')
                return res.redirect('/register')
            })
        },
        postLogout(req, res) {
            req.logout()
            delete req.session.cart
            return res.redirect('/login')
        },
        getForgotPassword(req, res) {
            res.render('auth/forgotPassword')
        },
        postForgotPassword(req, res) {
            const { email } = req.body
            //validate request
            if (!email) {
                req.flash('error', 'All fields are required')
                return res.redirect('/forgot-password')
            }

            //email exist 
            User.findOne({ email: email }, (err, result) => {
                if (!result) {
                    req.flash('error', 'Please enter valid credentials')
                    return res.redirect('/forgot-password')
                } else {
                    const secret = process.env.JWT_SECRET + result.password
                    const token = jwt.sign({ result }, secret, { expiresIn: '15m' })
                    const link = `http://13.232.45.38/rest-password/${result._id}/${token}`
                    sendResetiLnk(result.email, link)
                    return res.render('auth/sendlink')
                }
            })
        },
        getResetPassword(req, res) {
            const { id, token } = req.params

            User.findOne({ _id: id }, (err, result) => {
                if (!result) {
                    req.flash('error', 'Please enter valid credentials')
                    return res.redirect('/forgot-password')
                } else {
                    const secret = process.env.JWT_SECRET + result.password
                    try {
                        const payload = jwt.verify(token, secret)
                        return res.render('auth/resetPassword', { email: result.email })
                    } catch (err) {
                        req.flash('error', 'Password reset link is expired')
                        return res.render('auth/forgotPassword')
                    }
                }
            })
        },
        postResetPassword(req, res) {
            const { id, token } = req.params
            const { password, cpassword } = req.body

            if (!password || !cpassword) {
                req.flash('error', 'All fields are required')
                return res.redirect(`/rest-password/${id}/${token}`)
            } else if (password !== cpassword) {
                req.flash('error', 'Password does not match')
                return res.redirect(`/rest-password/${id}/${token}`)
            } else {
                User.findOne({ _id: id }, async (err, user) => {
                    if (!user) {
                        req.flash('error', 'Please enter valid credentials')
                        return res.redirect('/forgot-password')
                    } else {
                        const secret = process.env.JWT_SECRET + user.password
                        try {
                            const payload = jwt.verify(token, secret)
                            const hashedPassword = await bcrypt.hash(password, 10)
                            user.password = hashedPassword
                            await user.save()
                            return res.redirect('/login')
                        } catch (err) {
                            req.flash('error', 'Password reset link is expired')
                            return res.render('auth/forgotPassword')
                        }
                    }
                })
            }
        }

    }
}

module.exports = authControler