import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/types';

// Define interface for scenario
interface ScenarioData {
  text: string;
}

// Initialize OpenAI client only when API key is available
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set');
    return null;
  }
  
  return new OpenAI({ apiKey });
};

export async function POST(request: Request) {
  try {
    const { userProfile } = await request.json() as { userProfile: UserProfile };
    
    const openai = getOpenAIClient();
    
    if (!openai) {
      // Return mock data for development or when API key is missing
      return NextResponse.json({
        scenarios: Array(5).fill(null).map((_, index) => ({
          id: `scenario-${index + 1}`,
          text: `This is a placeholder scenario for ${userProfile.role} in ${userProfile.educationalSetting} education. Add your OpenAI API key to generate real scenarios.`,
        }))
      });
    }
    
    const prompt = `
      Generate 10 future scenarios about digital education. Each scenario should be 1-2 paragraphs long.
      
      The scenarios should be tailored for a ${userProfile.role} who has ${userProfile.experienceLevel} experience with digital tools
      and works in ${userProfile.educationalSetting} education.
      
      They are facing these challenges: ${userProfile.challenges}
      
      Each scenario should describe a possible future for digital education that could be either hopeful or concerning.
      Make the scenarios diverse, thought-provoking, and realistic.
      
      Format the response as a JSON array of objects, where each object has a single key "text" with the scenario text as the value.
      Example: [{"text": "Scenario 1 text here..."}, {"text": "Scenario 2 text here..."}, ...]
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0].message.content;
    let scenariosData;
    
    try {
      scenariosData = JSON.parse(responseContent || '{"scenarios": []}');
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
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