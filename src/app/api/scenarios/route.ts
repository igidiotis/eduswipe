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
        scenarios: getSampleScenarios(userProfile).slice(0, 5).map((scenario, index) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }))
      });
    }
    
    // Use the reliable model
    console.log('Using gemini-pro model for generation');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Generate exactly 5 future scenarios about digital education. Each scenario should be 1-2 paragraphs long (about 100-150 words each).
      
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
          {"text": "Third scenario text..."},
          {"text": "Fourth scenario text..."},
          {"text": "Fifth scenario text..."}
        ]
      }
      
      Ensure you generate EXACTLY 5 scenarios - no more, no less.
      Do not include any explanations, markdown formatting, or code blocks. Return ONLY the pure JSON object.
    `;

    console.log('Sending prompt to Gemini API with request for 5 scenarios');
    
    // Generate content with Gemini
    try {
      // Set safety setting that allows more content
      const generationConfig = {
        temperature: 0.9,  // Higher for more creativity
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      };
      
      console.log('Generation config:', generationConfig);
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      // Check if we have a response
      if (!result || !result.response) {
        console.error('Empty result from Gemini API');
        throw new Error('Empty API response');
      }
      
      const response = await result.response;
      const responseText = response.text();
      
      // Check if the response is empty
      if (!responseText || responseText.trim().length === 0) {
        console.error('Empty text response from Gemini API');
        throw new Error('Empty text response');
      }
      
      console.log('Received response from Gemini API');
      console.log('Response length:', responseText.length);
      console.log('Response preview:', responseText.substring(0, 200) + '...');
      
      // Parse the JSON response
      let scenariosData;
      let jsonString = responseText.trim();
        
      // Remove any markdown code blocks
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n|```/g, '').trim();
        console.log('Removed json code block markers');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n|```/g, '').trim();
        console.log('Removed generic code block markers');
      }
      
      // Try to parse the JSON
      try {
        console.log('Attempting to parse JSON');
        scenariosData = JSON.parse(jsonString);
        
        if (!scenariosData.scenarios || !Array.isArray(scenariosData.scenarios)) {
          console.error('Parsed JSON is missing scenarios array:', scenariosData);
          throw new Error('Invalid JSON structure');
        }
        
        console.log(`Successfully parsed ${scenariosData.scenarios.length} scenarios`);
        
        let scenarios = scenariosData.scenarios;
        
        // Ensure we have exactly 5 scenarios
        if (scenarios.length === 0) {
          console.log('Empty scenarios array returned by API');
          throw new Error('No scenarios in response');
        } else if (scenarios.length < 5) {
          console.log(`Only ${scenarios.length} scenarios returned, adding some fallbacks`);
          // Add some fallbacks to reach 5
          const fallbacks = getSampleScenarios(userProfile).slice(0, 5 - scenarios.length);
          scenarios = [...scenarios, ...fallbacks];
        } else if (scenarios.length > 5) {
          console.log(`${scenarios.length} scenarios returned, limiting to 5`);
          // Limit to 5 scenarios
          scenarios = scenarios.slice(0, 5);
        }
        
        // Add unique IDs to each scenario
        const scenariosWithIds = scenarios.map((scenario: ScenarioData, index: number) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }));

        console.log(`Returning ${scenariosWithIds.length} AI-generated scenarios`);
        return NextResponse.json({ scenarios: scenariosWithIds });
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        console.log('Raw response:', responseText);
        throw parseError; // Re-throw to be caught by outer catch
      }
    } catch (apiError) {
      console.error('Gemini API error or parsing error:', apiError);
      console.log('Trying one more attempt with different prompt');
      
      // One more attempt with a simpler prompt
      try {
        const simplePrompt = `
          Generate exactly 5 short future scenarios about digital education for a ${userProfile.role}.
          Each scenario should address the challenge: ${userProfile.challenges}.
          Format as JSON: {"scenarios":[{"text":"scenario 1"},{"text":"scenario 2"},{"text":"scenario 3"},{"text":"scenario 4"},{"text":"scenario 5"}]}
          Keep it simple and valid JSON.
        `;
        
        const secondResult = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: simplePrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        });
        
        const secondResponse = await secondResult.response;
        const secondText = secondResponse.text();
        
        console.log('Second attempt response preview:', secondText.substring(0, 200) + '...');
        
        // Try to parse, but don't throw if it fails
        try {
          let cleanJson = secondText.trim();
          if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/```json\n|```/g, '').trim();
          }
          
          const data = JSON.parse(cleanJson);
          if (data.scenarios && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
            console.log(`Second attempt successful: ${data.scenarios.length} scenarios`);
            
            // Ensure we have exactly 5 scenarios
            let finalScenarios = data.scenarios;
            if (finalScenarios.length < 5) {
              // Add fallbacks to reach 5
              const fallbacks = getSampleScenarios(userProfile).slice(0, 5 - finalScenarios.length);
              finalScenarios = [...finalScenarios, ...fallbacks];
            } else if (finalScenarios.length > 5) {
              // Limit to 5 scenarios
              finalScenarios = finalScenarios.slice(0, 5);
            }
            
            const scenariosWithIds = finalScenarios.map((scenario: ScenarioData, index: number) => ({
              id: `scenario-${index + 1}`,
              text: scenario.text,
            }));
            
            return NextResponse.json({ scenarios: scenariosWithIds });
          }
        } catch (secondParseError) {
          console.error('Second attempt also failed:', secondParseError);
        }
      } catch (secondApiError) {
        console.error('Second API attempt also failed:', secondApiError);
      }
      
      // If we reach here, all AI attempts failed, use fallback
      console.log('All AI attempts failed - using fallback scenarios');
      return NextResponse.json({
        scenarios: getSampleScenarios(userProfile).slice(0, 5).map((scenario, index) => ({
          id: `scenario-${index + 1}`,
          text: scenario.text,
        }))
      });
    }
  } catch (error) {
    console.error('Error generating scenarios:', error);
    
    // If we can't even get user profile, return generic scenarios
    const genericScenarios = Array(5).fill(null).map((_, index) => ({
      id: `scenario-${index + 1}`,
      text: `This is a sample scenario ${index + 1} about digital education future. In this hypothetical situation, technology continues to evolve and transform how we learn and teach.`,
    }));
    
    return NextResponse.json({ scenarios: genericScenarios });
  }
} 