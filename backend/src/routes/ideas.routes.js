const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
const authenticateToken = require('../middlewares/auth.middlewares');

// POST route to save an idea (requires authentication)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { title, description, language, hardware, domain } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        error: 'Title and description are required'
      });
    }

    if (!language) {
      return res.status(400).json({
        error: 'Technology stack (language) is required'
      });
    }

    // Check if idea already exists for this user (optional duplicate check)
    const existingIdea = await prisma.idea.findFirst({
      where: {
        userId: userId,
        title: title,
        description: description
      }
    });

    if (existingIdea) {
      return res.status(400).json({
        error: 'This idea is already saved to your favorites'
      });
    }

    // Create new idea
    const savedIdea = await prisma.idea.create({
      data: {
        title,
        description,
        language,
        hardware: hardware || null,
        domain: domain || null,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Idea saved successfully',
      idea: savedIdea
    });

  } catch (error) {
    console.error('Save idea error:', error);
    res.status(500).json({
      error: 'Failed to save idea',
      details: error.message
    });
  }
});

// GET route to fetch user's saved ideas (requires authentication)
router.get('/my-ideas', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const ideas = await prisma.idea.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      ideas,
      count: ideas.length
    });

  } catch (error) {
    console.error('Fetch ideas error:', error);
    res.status(500).json({
      error: 'Failed to fetch ideas',
      details: error.message
    });
  }
});

// DELETE route to remove an idea (requires authentication)
router.delete('/delete/:ideaId', authenticateToken, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userId = req.user.id;

    // Check if idea exists and belongs to user
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: userId
      }
    });

    if (!idea) {
      return res.status(404).json({
        error: 'Idea not found or you do not have permission to delete it'
      });
    }

    // Delete the idea
    await prisma.idea.delete({
      where: { id: ideaId }
    });

    res.status(200).json({
      success: true,
      message: 'Idea deleted successfully'
    });

  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({
      error: 'Failed to delete idea',
      details: error.message
    });
  }
});

// GET route to fetch idea by ID (requires authentication)
router.get('/:ideaId', authenticateToken, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userId = req.user.id;

    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!idea) {
      return res.status(404).json({
        error: 'Idea not found'
      });
    }

    res.status(200).json({
      success: true,
      idea
    });

  } catch (error) {
    console.error('Fetch idea error:', error);
    res.status(500).json({
      error: 'Failed to fetch idea',
      details: error.message
    });
  }
});

module.exports = router;