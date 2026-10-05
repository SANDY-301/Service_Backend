const ServiceCategory = require('../models/ServiceCategory');
const ServiceProblem = require('../models/ServiceProblem');

// @desc    Get all service categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const categoryExists = await ServiceCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await ServiceCategory.create({ name, icon, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service problems for a specific category
// @route   GET /api/categories/:categoryId/problems
// @access  Public
const getCategoryProblems = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const problems = await ServiceProblem.find({ categoryId, isActive: true });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service problem for a category
// @route   POST /api/categories/:categoryId/problems
// @access  Private/Admin
const createServiceProblem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { problemName, description } = req.body;

    const problem = await ServiceProblem.create({
      categoryId,
      problemName,
      description,
    });
    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  getCategoryProblems,
  createServiceProblem,
};
