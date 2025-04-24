import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/types';

// Define interface for scenario
interface ScenarioData {
  text: string;
}

// Sample scenarios for when AI fails
const getSampleScenarios = (userProfile: UserProfile) => {
  return [
    {
      text: `In the next decade, personalized AI tutors will revolutionize how ${userProfile.role}s interact with educational content. These AI companions will adapt to your ${userProfile.experienceLevel} level, providing just the right amount of guidance without overwhelming you. The biggest impact will be in addressing your challenge of "${userProfile.challenges}" by offering tailored solutions that evolve as you learn.`
    },
    {
      text: `Virtual reality classrooms will transform ${userProfile.educationalSetting} education, creating immersive learning environments that transcend physical limitations. Students and teachers will meet in digital spaces that simulate historical events, scientific phenomena, or artistic creations. This technology will be particularly effective in addressing "${userProfile.challenges}" by making abstract concepts tangible and interactive.`
    },
    {
      text: `The rise of micro-credentials and skill-based certifications will disrupt traditional ${userProfile.educationalSetting} models. Instead of lengthy degree programs, learners will assemble personalized educational pathways composed of specific skills. This flexibility will be particularly valuable for ${userProfile.role}s with ${userProfile.experienceLevel} digital experience, allowing them to progress at their own pace while addressing challenges like "${userProfile.challenges}".`
    },
    {
      text: `AI-powered assessment tools will eliminate traditional testing in ${userProfile.educationalSetting} settings, replacing exams with continuous evaluation of actual performance. For ${userProfile.role}s, this means no more cramming for tests - instead, your daily interactions with learning materials will generate a comprehensive understanding of your strengths and weaknesses, with special focus on overcoming "${userProfile.challenges}".`
    },
    {
      text: `Global collaborative learning networks will connect ${userProfile.role}s across continents, allowing real-time cooperation on projects regardless of location. This will be particularly transformative for ${userProfile.educationalSetting} education, where exposure to diverse perspectives can enhance learning outcomes. These networks will specifically help address "${userProfile.challenges}" by bringing together different approaches and solutions from around the world.`
    },
    {
      text: `Digital divide gaps may widen as advanced educational technologies become available primarily to well-funded institutions. For ${userProfile.role}s in some ${userProfile.educationalSetting} settings, this could exacerbate existing inequalities. Those with ${userProfile.experienceLevel} experience may still struggle to access cutting-edge tools, making challenges like "${userProfile.challenges}" even more difficult to overcome without systemic support.`
    },
    {
      text: `Privacy concerns will intensify as educational data mining becomes standard practice in ${userProfile.educationalSetting} environments. Learning analytics will track every interaction ${userProfile.role}s have with digital tools, raising questions about ownership and use of this information. This will be particularly concerning for those facing challenges like "${userProfile.challenges}", as personal struggles might become permanently recorded in educational profiles.`
    },
    {
      text: `Automated content creation tools will allow ${userProfile.role}s to produce professional-quality educational materials regardless of their technical skills. Even those with ${userProfile.experienceLevel} experience will be able to create engaging interactive lessons, simulations, and assessments for ${userProfile.educationalSetting} contexts. This democratization of content creation will directly address challenges like "${userProfile.challenges}" by lowering technical barriers.`
    },
    {
      text: `Brain-computer interfaces might eventually enable direct knowledge transfer, completely transforming how ${userProfile.role}s learn in ${userProfile.educationalSetting} settings. Rather than studying traditionally, neural connections could be formed synthetically. This technology raises profound ethical questions while potentially offering revolutionary solutions to challenges like "${userProfile.challenges}" by bypassing conventional learning limitations.`
    },
    {
      text: `Education might fragment into competing proprietary ecosystems, each with their own standards and credentials. For ${userProfile.role}s in ${userProfile.educationalSetting} environments, this could mean navigating multiple platforms and subscription services, potentially increasing costs and complexity. This fragmentation could make addressing "${userProfile.challenges}" more difficult as solutions become less standardized and interoperable.`
    }
  ];
};

// Initialize Gemini client only when API key is available
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set');
    return null;
  }
  
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: Request) {
  console.log('=== SCENARIO GENERATION API CALLED ===');
  
  try {
    const { userProfile } = await request.json() as { userProfile: UserProfile };
    console.log('User profile received:', JSON.stringify(userProfile));
    
    const genAI = getGeminiClient();
    
    if (!genAI) {
      console.log('No API key found - returning mock scenarios');
      // Return mock data for development or when API key is missing
      return NextResponse.json({
        scenarios: getSampleScenarios(userProfile).map((scenario, index) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }))
      });
    }
    
    // Try different models in sequence if one fails
    const modelOptions = [
      "gemini-flash-2.5",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro"
    ];
    
    let model;
    let modelUsed;
    
    // Try each model until one works
    for (const modelName of modelOptions) {
      try {
        console.log(`Attempting to use ${modelName} model`);
        model = genAI.getGenerativeModel({ model: modelName });
        modelUsed = modelName;
        console.log(`Successfully initialized ${modelName} model`);
        break;
      } catch (error) {
        console.error(`Failed to initialize ${modelName} model:`, error);
      }
    }
    
    if (!model) {
      console.log('All models failed to initialize - using sample scenarios');
      return NextResponse.json({
        scenarios: getSampleScenarios(userProfile).map((scenario, index) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }))
      });
    }
    
    console.log(`Using ${modelUsed} model for generation`);
    
    const prompt = `
      Generate 10 future scenarios about digital education. Each scenario should be 1-2 paragraphs long.
      
      The scenarios should be tailored for a ${userProfile.role} who has ${userProfile.experienceLevel} experience with digital tools
      and works in ${userProfile.educationalSetting} education.
      
      They are facing these challenges: ${userProfile.challenges}
      
      Each scenario should describe a possible future for digital education that could be either hopeful or concerning.
      Make the scenarios diverse, thought-provoking, and realistic.
      
      Format the response ONLY as a valid JSON object with this exact structure: 
      {
        "scenarios": [
          {"text": "First scenario text..."},
          {"text": "Second scenario text..."},
          ...and so on
        ]
      }
      
      Do not include any explanations, markdown formatting, or anything else outside the JSON structure.
    `;

    console.log('Sending prompt to Gemini API');
    
    // Generate content with Gemini
    try {
      // Set a safety setting that allows more content
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      };
      
      console.log('Generation config:', generationConfig);
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Received response from Gemini API');
      console.log('Response length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 200) + '...');
      
      // Parse the JSON response
      let scenariosData;
      try {
        // Try several approaches to extract valid JSON
        let jsonString = responseText.trim();
        
        // Remove any markdown code blocks
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/```json\n|```/g, '').trim();
          console.log('Removed json code block markers');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/```\n|```/g, '').trim();
          console.log('Removed generic code block markers');
        }
        
        // Alternative: extract anything that looks like JSON with a regex
        if (!jsonString.startsWith('{')) {
          console.log('Response does not start with {, attempting to extract JSON');
          const jsonMatch = jsonString.match(/({[\s\S]*})/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
            console.log('Extracted JSON using regex');
          }
        }
        
        console.log('Attempting to parse JSON:', jsonString.substring(0, 100) + '...');
        scenariosData = JSON.parse(jsonString);
        
        if (!scenariosData.scenarios || !Array.isArray(scenariosData.scenarios)) {
          console.error('Parsed JSON is missing scenarios array:', scenariosData);
          throw new Error('Invalid JSON structure');
        }
        
        console.log(`Successfully parsed ${scenariosData.scenarios.length} scenarios`);
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        console.log('Raw response:', responseText);
        
        // Try one more approach - if we can identify JSON objects in the text
        try {
          console.log('Attempting to extract individual scenario objects');
          const scenarioMatches = responseText.match(/\{"text":[^\}]+\}/g);
          if (scenarioMatches && scenarioMatches.length > 0) {
            console.log(`Found ${scenarioMatches.length} scenario objects via regex`);
            const extractedScenarios = scenarioMatches.map(match => JSON.parse(match));
            scenariosData = { scenarios: extractedScenarios };
            console.log('Successfully created scenarios array from extracted objects');
          } else {
            console.log('Failed to extract individual scenario objects');
            throw new Error('Could not extract scenarios from response');
          }
        } catch (extractError) {
          console.error('Final extraction attempt failed:', extractError);
          console.log('Using fallback sample scenarios');
          
          // Use sample scenarios when all parsing attempts fail
          return NextResponse.json({
            scenarios: getSampleScenarios(userProfile).map((scenario, index) => ({
              id: `scenario-${index + 1}`,
              text: scenario.text,
            }))
          });
        }
      }

      const scenarios = scenariosData.scenarios || [];
      
      if (scenarios.length === 0) {
        console.log('Empty scenarios array - using sample scenarios');
        return NextResponse.json({
          scenarios: getSampleScenarios(userProfile).map((scenario, index) => ({
            id: `scenario-${index + 1}`,
            text: scenario.text,
          }))
        });
      }
      
      // Add unique IDs to each scenario
      const scenariosWithIds = scenarios.map((scenario: ScenarioData, index: number) => ({
        id: `scenario-${index + 1}`,
        text: scenario.text,
      }));

      console.log(`Returning ${scenariosWithIds.length} generated scenarios`);
      return NextResponse.json({ scenarios: scenariosWithIds });
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      console.log('Using fallback sample scenarios due to API error');
      
      return NextResponse.json({
        scenarios: getSampleScenarios(userProfile).map((scenario, index) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }))
      });
    }
  } catch (error) {
    console.error('Error generating scenarios:', error);
    
    // If we can't even get user profile, return generic scenarios
    const genericScenarios = Array(10).fill(null).map((_, index) => ({
      id: `scenario-${index + 1}`,
      text: `This is a sample scenario ${index + 1} about digital education future. In this hypothetical situation, technology continues to evolve and transform how we learn and teach.`,
    }));
    
    return NextResponse.json({ scenarios: genericScenarios });
  }
} 