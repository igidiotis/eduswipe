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
      // Return mock data for development or when API key is missing
      return NextResponse.json({
        scenarios: Array(5).fill(null).map((_, index) => ({
          id: `scenario-${index + 1}`,
          text: `This is a placeholder scenario for ${userProfile.role} in ${userProfile.educationalSetting} education. Add your Gemini API key to generate real scenarios.`,
        }))
      });
    }
    
    // Get Gemini model - using flash version 2.5
    const model = genAI.getGenerativeModel({ model: "gemini-flash-2.5" });
    
    const prompt = `
      Generate 10 future scenarios about digital education. Each scenario should be 1-2 paragraphs long.
      
      The scenarios should be tailored for a ${userProfile.role} who has ${userProfile.experienceLevel} experience with digital tools
      and works in ${userProfile.educationalSetting} education.
      
      They are facing these challenges: ${userProfile.challenges}
      
      Each scenario should describe a possible future for digital education that could be either hopeful or concerning.
      Make the scenarios diverse, thought-provoking, and realistic.
      
      Format the response as a JSON array of objects, where each object has a single key "text" with the scenario text as the value.
      Example: {"scenarios": [{"text": "Scenario 1 text here..."}, {"text": "Scenario 2 text here..."}, ...]}
      
      Ensure your response contains ONLY valid JSON and nothing else, so it can be parsed directly.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    let scenariosData;
    try {
      // The response might be enclosed in code blocks or have other text, try to extract JSON
      const jsonMatch = responseText.match(/({.*})/s);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      scenariosData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.log('Raw response:', responseText);
      return NextResponse.json({ error: 'Failed to parse scenarios' }, { status: 500 });
    }

    const scenarios = scenariosData.scenarios || [];
    
    // Add unique IDs to each scenario
    const scenariosWithIds = scenarios.map((scenario: ScenarioData, index: number) => ({
      id: `scenario-${index + 1}`,
      text: scenario.text,
    }));

    return NextResponse.json({ scenarios: scenariosWithIds });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json({ error: 'Failed to generate scenarios' }, { status: 500 });
  }
} 