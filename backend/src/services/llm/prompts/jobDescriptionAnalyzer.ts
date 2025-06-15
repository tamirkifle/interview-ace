export class JobDescriptionAnalyzer {
    analyzeJobDescription(jobDescription: string): {
      suggestedCategories: string[];
      suggestedTraits: string[];
      keySkills: string[];
      seniorityLevel: 'junior' | 'mid' | 'senior' | 'staff' | 'principal';
    } {
      const lowerDesc = jobDescription.toLowerCase();
      
      // Analyze for categories
      const suggestedCategories: string[] = [];
      
      if (lowerDesc.includes('lead') || lowerDesc.includes('mentor') || lowerDesc.includes('manage')) {
        suggestedCategories.push('Leadership');
      }
      if (lowerDesc.includes('collaborat') || lowerDesc.includes('cross-functional') || lowerDesc.includes('team')) {
        suggestedCategories.push('Teamwork');
      }
      if (lowerDesc.includes('problem') || lowerDesc.includes('debug') || lowerDesc.includes('troubleshoot')) {
        suggestedCategories.push('Problem Solving');
      }
      if (lowerDesc.includes('communicat') || lowerDesc.includes('present') || lowerDesc.includes('stakeholder')) {
        suggestedCategories.push('Communication');
      }
      if (lowerDesc.includes('innovat') || lowerDesc.includes('improv') || lowerDesc.includes('new')) {
        suggestedCategories.push('Innovation');
      }
      if (lowerDesc.includes('impact') || lowerDesc.includes('result') || lowerDesc.includes('deliver')) {
        suggestedCategories.push('Impact');
      }
      
      // Analyze for traits
      const suggestedTraits: string[] = [];
      
      if (lowerDesc.includes('ownership') || lowerDesc.includes('responsible')) {
        suggestedTraits.push('Ownership');
      }
      if (lowerDesc.includes('data') || lowerDesc.includes('metric') || lowerDesc.includes('analyz')) {
        suggestedTraits.push('Data-Driven', 'Analytical Thinking');
      }
      if (lowerDesc.includes('customer') || lowerDesc.includes('user') || lowerDesc.includes('client')) {
        suggestedTraits.push('Customer Focus');
      }
      if (lowerDesc.includes('strateg') || lowerDesc.includes('vision') || lowerDesc.includes('roadmap')) {
        suggestedTraits.push('Strategic Thinking');
      }
      if (lowerDesc.includes('execute') || lowerDesc.includes('deliver') || lowerDesc.includes('ship')) {
        suggestedTraits.push('Execution', 'Results-Oriented');
      }
      
      // Extract key skills
      const keySkills: string[] = [];
      const skillPatterns = [
        /experience with ([\w\s,]+)/gi,
        /proficient in ([\w\s,]+)/gi,
        /knowledge of ([\w\s,]+)/gi,
        /familiar with ([\w\s,]+)/gi,
      ];
      
      skillPatterns.forEach(pattern => {
        const matches = jobDescription.matchAll(pattern);
        for (const match of matches) {
          keySkills.push(...match[1].split(',').map(s => s.trim()));
        }
      });
      
      // Determine seniority level
      let seniorityLevel: 'junior' | 'mid' | 'senior' | 'staff' | 'principal' = 'mid';
      
      if (lowerDesc.includes('principal') || lowerDesc.includes('staff')) {
        seniorityLevel = lowerDesc.includes('principal') ? 'principal' : 'staff';
      } else if (lowerDesc.includes('senior') || lowerDesc.includes('lead')) {
        seniorityLevel = 'senior';
      } else if (lowerDesc.includes('junior') || lowerDesc.includes('entry') || lowerDesc.includes('early career')) {
        seniorityLevel = 'junior';
      }
      
      return {
        suggestedCategories: [...new Set(suggestedCategories)],
        suggestedTraits: [...new Set(suggestedTraits)],
        keySkills: [...new Set(keySkills)],
        seniorityLevel
      };
    }
  }