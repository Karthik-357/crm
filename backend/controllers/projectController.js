const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const activeProjectsThisMonth = await Project.countDocuments({ status: 'in-progress' });
    const allProjects = await Project.find();
    const revenueThisMonth = allProjects.reduce((acc, p) => acc + (p.value || 0), 0);
    res.json({
      activeProjects: {
        thisMonth: activeProjectsThisMonth,
        lastMonth: 0
      },
      revenue: {
        thisMonth: revenueThisMonth,
        lastMonth: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 