const Menu = require('../../models/menu')
function homeController() {
    return {
        async index(req, res) {
            const user = req.app.get('user')

            const pizzas = await Menu.find()
            if (req.xhr) {
                return res.json({ pizzas, user })
            } else {
                return res.render('home')
            }
        }
    }
}

module.exports = homeController

