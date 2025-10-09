const reviewModel = require('../models/review-model')
const utilities = require('../utilities/')
const invModel = require('../models/inventory-model') 

const reviewController = {}

/* ****************************************
 * Process a new review
 * *************************************** */
reviewController.addReview = async function (req, res, next) {
    const { review_text, inv_id } = req.body
    const account_id = res.locals.accountData.account_id 

    const reviewResult = await reviewModel.createReview(review_text, inv_id, account_id)

    if (reviewResult) {
        req.flash("notice", "Your review was succesfully added!")
    } else {
        req.flash("notice", "Error when adding the review. Try again.")
    }
    
    res.redirect(`/inv/detail/${inv_id}`)
}

/* ****************************************
 * Displays the Assessment Edit View
 * *************************************** */
reviewController.buildEditView = async function (req, res, next) {
    const review_id = parseInt(req.params.review_id)
    const reviewData = await reviewModel.getReviewById(review_id)

    if (!reviewData || reviewData.account_id !== res.locals.accountData.account_id) {
        req.flash("notice", "Avaliação não encontrada ou você não tem permissão para editar.")
        return res.redirect("/account/") 
    }
    
    const vehicleData = await invModel.getVehicleById(reviewData.inv_id)

    let nav = await utilities.getNav()
    res.render("./review/edit", { 
        title: `Editar Avaliação sobre ${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        errors: null,
        review_id: reviewData.review_id,
        review_text: reviewData.review_text,
        vehicleName: `${vehicleData.inv_make} ${vehicleData.inv_model}`
    })
}

/* ****************************************
 * Process the review update
 * *************************************** */
reviewController.updateReview = async function (req, res, next) {
    const { review_id, review_text } = req.body
    
    
    const updateResult = await reviewModel.updateReview(review_id, review_text)

    if (updateResult) {
        req.flash("notice", "Avaliação atualizada com sucesso.")
        return res.redirect("/account/")
    } else {
        req.flash("notice", "Erro na atualização da avaliação.")
        return res.redirect(`/review/edit/${review_id}`) 
    }
}

/* ****************************************
 * Process the review deletion
 * *************************************** */
reviewController.deleteReview = async function (req, res, next) {
    const review_id = parseInt(req.body.review_id)

    const deleteResult = await reviewModel.deleteReview(review_id)

    if (deleteResult) {
        req.flash("notice", "Avaliação deletada com sucesso.")
    } else {
        req.flash("notice", "Erro ao deletar avaliação.")
    }
    return res.redirect("/account/")
}



module.exports = reviewController