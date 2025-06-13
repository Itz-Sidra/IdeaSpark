const express = require("express");
const router = express.Router();
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-ideas", async (req, res) => {
  try {
    const {
      numberOfIdeas,
      techStack,
      hardwareComponents,
      complexity,
      domain,
      additionalRequirements,
    } = req.body;

    if (!numberOfIdeas || numberOfIdeas < 1 || numberOfIdeas > 5) {
      return res.status(400).json({
        error: "Number of ideas must be between 1 and 5",
      });
    }

    if (!techStack || !complexity) {
      return res.status(400).json({
        error: "Technology stack and complexity are required fields",
      });
    }

    const prompt = generatePrompt({
      numberOfIdeas,
      techStack,
      hardwareComponents,
      complexity,
      domain,
      additionalRequirements,
    });

    console.log("Generated Prompt:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedIdeas = response.text();

    const formattedResponse = formatGeneratedIdeas(
      generatedIdeas,
      numberOfIdeas
    );

    res.status(200).json({
      success: true,
      numberOfIdeas: numberOfIdeas,
      ideas: formattedResponse,
      rawResponse: generatedIdeas,
      parameters: {
        techStack,
        hardwareComponents: hardwareComponents || "None specified",
        complexity,
        domain: domain || "General",
        additionalRequirements: additionalRequirements || "None",
      },
    });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({
      error: "Failed to generate project ideas",
      details: err.message,
    });
  }
});

function generatePrompt({
  numberOfIdeas,
  techStack,
  hardwareComponents,
  complexity,
  domain,
  additionalRequirements,
}) {
  const prompt = `
You are an expert tech project advisor. Generate exactly ${numberOfIdeas} unique and creative tech project idea${
    numberOfIdeas > 1 ? "s" : ""
  } based on the following parameters:

**Project Requirements:**
- Technology Stack: ${techStack}
- Hardware Components: ${hardwareComponents || "None/Software Only"}
- Project Complexity: ${complexity}
- Project Domain: ${domain || "General/Open Domain"}
- Additional Requirements: ${additionalRequirements || "None specified"}

**IMPORTANT FORMATTING INSTRUCTIONS:**
${
  numberOfIdeas === 1
    ? "Generate ONE complete project idea with all sections below:"
    : `Generate exactly ${numberOfIdeas} separate project ideas. Number each idea clearly as "PROJECT IDEA 1:", "PROJECT IDEA 2:", etc.`
}

**For each project idea, provide:**
- **Project Title:** A catchy, descriptive name
- **Problem Statement:** What real-world problem does this solve?
- **Core Functionality:** Key features and how it works
- **Technology Integration:** How the specified tech stack and hardware work together
- **Innovation Factor:** What makes this project unique or innovative
- **Complexity Justification:** Why this is appropriate for ${complexity.toLowerCase()} level
- **Real-World Use Case:** Specific scenarios where this would be valuable
- **Implementation Timeline:** Estimated time to complete (weeks/months)

**Complexity Guidelines:**
${getComplexityGuidelines(complexity)}

${
  numberOfIdeas > 1
    ? `Please ensure each of the ${numberOfIdeas} ideas is completely distinct, feasible, and exciting to work on. Separate each idea clearly with "PROJECT IDEA X:" headers.`
    : "Please ensure the idea is distinct, feasible, and exciting to work on."
}
`;

  return prompt;
}

function getComplexityGuidelines(complexity) {
  const guidelines = {
    Beginner: `
- Use fundamental concepts and basic implementations
- Focus on learning core technologies
- Should be completable in 2-4 weeks
- Emphasize step-by-step learning progression
- Include clear documentation and tutorials`,

    Intermediate: `
- Integrate multiple components and systems
- Require problem-solving and system design
- Should be completable in 1-2 months
- Include data processing and user interaction
- Demonstrate good software engineering practices`,

    Advanced: `
- Implement sophisticated algorithms and architectures
- Require optimization and performance considerations
- Should be completable in 2-4 months
- Include complex user interfaces and system integration
- Demonstrate advanced technical skills`,

    Research: `
- Push beyond current standard implementations
- Require novel approaches or methodologies
- May take 3-6 months or longer
- Contribute new knowledge or techniques to the field
- Include experimental components and evaluation metrics`,
  };

  return guidelines[complexity] || guidelines["Intermediate"];
}

function formatGeneratedIdeas(rawResponse, numberOfIdeas) {
  try {
    let ideas = [];

    if (numberOfIdeas === 1) {
      ideas = [
        {
          id: 1,
          content: rawResponse.trim(),
          timestamp: new Date().toISOString(),
        },
      ];
    } else {
      const splits = rawResponse.split(
        /(?=PROJECT IDEA \d+:|IDEA \d+:|\*\*PROJECT IDEA \d+:\*\*|\*\*IDEA \d+:\*\*)/i
      );

      ideas = splits
        .filter((idea) => idea.trim().length > 100)
        .slice(0, numberOfIdeas)
        .map((idea, index) => ({
          id: index + 1,
          content: idea.trim(),
          timestamp: new Date().toISOString(),
        }));

      if (ideas.length < numberOfIdeas) {
        console.log("Splitting failed, using fallback approach");
        ideas = [
          {
            id: 1,
            content: rawResponse.trim(),
            timestamp: new Date().toISOString(),
          },
        ];
      }
    }

    return ideas;
  } catch (error) {
    console.log("Formatting error, returning raw response:", error.message);
    return [
      {
        id: 1,
        content: rawResponse,
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

router.post("/generate-idea", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || input.trim() === "") {
      return res.status(400).json({ error: "Input is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Generate a unique and creative tech project idea based on this input: "${input}". 
    Include details such as the domain, technologies involved, and potential real-world use case.
    
    Please format your response with clear sections for:
    - Project Title
    - Problem Statement
    - Core Functionality
    - Technologies Required
    - Real-World Applications
    - Implementation Considerations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      idea: text,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({
      error: "Failed to generate idea",
      details: err.message,
    });
  }
});

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "AI Service is healthy",
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "POST /api/ai/generate-ideas - Generate structured project ideas",
      "POST /api/ai/generate-idea - Generate single idea (legacy)",
      "GET /api/ai/health - Health check",
    ],
  });
});

module.exports = router;
