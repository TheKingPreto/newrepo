const pool = require("../database/")

/* ****************************************
 * INSERT a new review
 * *************************************** */
async function createReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review (review_text, inv_id, account_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `
    return await pool.query(sql, [review_text, inv_id, account_id])
  } catch (error) {
    console.error("createReview error: " + error)
    return null
  }
}

/* ****************************************
 * GET reviews by ID
 * *************************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_text, 
        r.review_date, 
        r.review_id,
        a.account_firstname, 
        a.account_lastname
      FROM 
        review r
      JOIN 
        account a ON r.account_id = a.account_id
      WHERE 
        r.inv_id = $1
      ORDER BY 
        r.review_date DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: " + error)
    return [] 
  }
}

/* ****************************************
 * GET review by review_id
 * *************************************** */
async function getReviewById(review_id) {
  try {
    const sql = "SELECT * FROM review WHERE review_id = $1"
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return null
  }
}

/* ****************************************
 * UPDATE review
 * *************************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = "UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *"
    const data = await pool.query(sql, [review_text, review_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("updateReview error: " + error)
    return false
  }
}

/* ****************************************
 * DELETE review
 * *************************************** */
async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM review WHERE review_id = $1'
    const data = await pool.query(sql, [review_id])
    return data.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    return false
  }
}

module.exports = { 
  createReview, 
  getReviewsByInventoryId,
  updateReview,
  deleteReview,
  getReviewById
}