import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/types';

// Define interface for scenario
interface ScenarioData {
  text: string;
}

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
  try {
    const { userProfile } = await request.json() as { userProfile: UserProfile };
    
    const genAI = getGeminiClient();
    
    if (!genAI) {
      console.log('Generating mock scenarios (no API key)');
      // Return mock data for development or when API key is missing
      return NextResponse.json({
        scenarios: Array(5).fill(null).map((_, index) => ({
          id: `scenario-${index + 1}`,
          text: `This is a placeholder scenario for ${userProfile.role} in ${userProfile.educationalSetting} education. Add your Gemini API key to generate real scenarios.`,
        }))
      });
    }
    
    // Get Gemini model - using flash version 2.5
    // If gemini-flash-2.5 fails, we'll fall back to gemini-1.5-flash
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-flash-2.5" });
      console.log('Using Gemini Flash 2.5 model');
    } catch (error) {
      console.log('Falling back to gemini-1.5-flash model');
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    
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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Received response from Gemini API');
      
      // Parse the JSON response
      let scenariosData;
      try {
        // Try several approaches to extract valid JSON
        let jsonString = responseText.trim();
        
        // Remove any markdown code blocks
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/```json\n|```/g, '').trim();
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/```\n|```/g, '').trim();
        }
        
        // Alternative: extract anything that looks like JSON with a regex
        if (!jsonString.startsWith('{')) {
          const jsonMatch = jsonString.match(/({[\s\S]*?})/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
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
          const scenarioMatches = responseText.match(/\{"text":[^\}]+\}/g);
          if (scenarioMatches && scenarioMatches.length > 0) {
            console.log('Extracting scenarios using regex');
            const extractedScenarios = scenarioMatches.map(match => JSON.parse(match));
            scenariosData = { scenarios: extractedScenarios };
          } else {
            throw new Error('Could not extract scenarios from response');
          }
        } catch (extractError) {
          console.error('Final extraction attempt failed:', extractError);
          return NextResponse.json({ error: 'Failed to parse scenarios' }, { status: 500 });
        }
      }

      const scenarios = scenariosData.scenarios || [];
      
      // Add unique IDs to each scenario
      const scenariosWithIds = scenarios.map((scenario: ScenarioData, index: number) => ({
        id: `scenario-${index + 1}`,
        text: scenario.text,
      }));

      return NextResponse.json({ scenarios: scenariosWithIds });
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      return NextResponse.json({ error: 'Error calling AI service' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json({ error: 'Failed to generate scenarios' }, { status: 500 });
  }
} 