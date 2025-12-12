// 'use strict';

// document.addEventListener('DOMContentLoaded', () => {
//     const invId = document.querySelector("#reviews-container")?.dataset.invId;
//     if (!invId) return;

//     const reviewsContainer = document.getElementById('reviews-container');

//     // Load reviews via AJAX
//     async function loadReviews() {
//         try {
//             const res = await fetch(`/review/inv/${invId}`);
//             const data = await res.json();

//             if (data.reviews.length === 0) {
//                 reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
//                 return;
//             }

//             reviewsContainer.innerHTML = data.reviews.map(r => `
//                 <div class="review-item">
//                     <strong>${r.review_screen_name}</strong> — ${new Date(r.review_date).toLocaleString()}
//                     <p>${r.review_text}</p>
//                 </div>
//             `).join('');
//         } catch (err) {
//             reviewsContainer.innerHTML = '<p>Error loading reviews.</p>';
//             console.error(err);
//         }
//     }

//     loadReviews();

//     // Add review form submission via AJAX
//     const addForm = document.getElementById('add-review-form');
//     if (addForm) {
//         addForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const reviewText = document.getElementById('review_text').value;

//             const res = await fetch('/review/add', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ inv_id: invId, review_text: reviewText })
//             });

//             const data = await res.json();
//             alert(data.message);

//             if (data.success) {
//                 document.getElementById('review_text').value = '';
//                 loadReviews(); // refresh reviews
//             }
//         });
//     }
// });
