const express = require('express');
const router = express.Router();
const { createSubmission, getAllSubmissions, deleteSubmission } = require('../controllers/submissionController');

router.post('/', createSubmission);
router.get('/', getAllSubmissions);
router.delete('/:id', deleteSubmission);

module.exports = router;