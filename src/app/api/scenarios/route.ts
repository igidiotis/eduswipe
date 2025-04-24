import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userProfile } = await request.json() as { userProfile: UserProfile };
    
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
    const scenariosWithIds = scenarios.map((scenario: any, index: number) => ({
      id: `scenario-${index + 1}`,
      text: scenario.text,
    }));

    return NextResponse.json({ scenarios: scenariosWithIds });
  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json({ error: 'Failed to generate scenarios' }, { status: 500 });
  }
} 