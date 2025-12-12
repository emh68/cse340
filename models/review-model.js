const pool = require("../database/")

/* *****************************
*  Add new review item
* *************************** */
async function addReview(review_text, inv_id, account_id, review_screen_name) {
    try {
        const sql = `
            INSERT INTO public.review 
                (review_text, inv_id, account_id, review_screen_name)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `
        const data = await pool.query(sql, [
            review_text,
            inv_id,
            account_id,
            review_screen_name
        ])
        return data.rows[0]
    } catch (error) {
        console.error("addReview error: ", error)
        return null
    }
}

/* *****************************
*  Get reviews by inventory id
* *************************** */
async function getReviewsByInvId(inv_id) {
    try {
        const sql = `
            SELECT review_id, review_text, review_date,
                   review_screen_name, account_id
            FROM public.review
            WHERE inv_id = $1
            ORDER BY review_date DESC
        `
        const data = await pool.query(sql, [inv_id])
        return data.rows
    } catch (error) {
        console.error("getReviewsByInvId error:", error)
        return []
    }
}

/* *****************************
*  Get reviews by account_id
* *************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `
            SELECT r.review_id, r.review_text, r.review_date, r.review_screen_name, r.inv_id, i.inv_year, i.inv_make, i.inv_model
            FROM public.review AS r
            JOIN public.inventory AS i
                ON r.inv_id = i.inv_id
            WHERE r.account_id = $1
            ORDER BY r.review_date DESC
        `;
        const data = await pool.query(sql, [account_id]);
        return data.rows;
    } catch (error) {
        console.error("getReviewsByAccountId error:", error);
        return [];
    }
}


/* *****************************
*  Get a single review by id
* *************************** */
async function getReviewById(review_id) {
    try {
        const sql = `
            SELECT review_id, review_text, review_date,
                   review_screen_name, inv_id, account_id
            FROM public.review
            WHERE review_id = $1
        `
        const data = await pool.query(sql, [review_id])
        return data.rows[0]
    } catch (error) {
        console.error("getReviewById error:", error)
        return null
    }
}

/* *****************************
*  Update a review
* *************************** */
async function updateReview(review_id, review_text) {
    try {
        const sql = `
            UPDATE public.review
            SET review_text = $1
            WHERE review_id = $2
            RETURNING *
        `
        const data = await pool.query(sql, [
            review_text,
            review_id
        ])

        return data.rows[0]
    } catch (error) {
        console.error("updateReview error:", error)
        return null
    }
}

/* *****************************
*  Delete a review
* *************************** */
async function deleteReview(review_id) {
    try {
        const sql = `
            DELETE FROM public.review
            WHERE review_id = $1
            RETURNING *
        `
        const data = await pool.query(sql, [review_id])
        return data.rows[0]
    } catch (error) {
        console.error("deleteReview error:", error)
        return null
    }
}

module.exports = { addReview, getReviewsByInvId, getReviewsByAccountId, getReviewById, updateReview, deleteReview }
