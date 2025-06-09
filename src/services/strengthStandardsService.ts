import { UserProfile } from '../types';

// Based on Strength Level database (10M+ lifts) and ExRx.net standards
interface StrengthStandards {
  beginner: number;
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}

interface TrainingVolumeStandards {
  lowVolume: number;
  moderateVolume: number;
  highVolume: number;
}

interface ConsistencyStandards {
  poor: number;
  fair: number;
  good: number;
  excellent: number;
}

export class StrengthStandardsService {
  // Strength standards (kg) based on bodyweight multipliers from Strength Level
  // Data aggregated from 10M+ lifts across demographics
  private strengthStandards: { [exercise: string]: { [gender: string]: StrengthStandards } } = {
    'Bench Press': {
      male: { beginner: 0.8, novice: 1.0, intermediate: 1.25, advanced: 1.5, elite: 1.8 },
      female: { beginner: 0.5, novice: 0.65, intermediate: 0.8, advanced: 1.0, elite: 1.2 }
    },
    'Squat': {
      male: { beginner: 1.0, novice: 1.25, intermediate: 1.5, advanced: 1.75, elite: 2.0 },
      female: { beginner: 0.75, novice: 0.9, intermediate: 1.1, advanced: 1.3, elite: 1.5 }
    },
    'Deadlift': {
      male: { beginner: 1.25, novice: 1.5, intermediate: 1.75, advanced: 2.0, elite: 2.25 },
      female: { beginner: 0.9, novice: 1.1, intermediate: 1.3, advanced: 1.5, elite: 1.7 }
    },
    'Overhead Press': {
      male: { beginner: 0.5, novice: 0.65, intermediate: 0.8, advanced: 0.95, elite: 1.1 },
      female: { beginner: 0.35, novice: 0.45, intermediate: 0.55, advanced: 0.65, elite: 0.75 }
    }
  };

  // Training volume standards (sets per week per muscle group)
  // Based on ACSM guidelines and meta-analyses (Schoenfeld et al., 2017)
  private volumeStandards: TrainingVolumeStandards = {
    lowVolume: 8,    // 4-8 sets/week - maintenance
    moderateVolume: 14, // 10-14 sets/week - optimal for most
    highVolume: 20   // 16-20 sets/week - advanced trainees
  };

  // Training frequency standards (sessions per week)
  // Based on research from Helms et al. (2014) and practical guidelines
  private frequencyStandards: ConsistencyStandards = {
    poor: 1,      // <2 sessions/week
    fair: 2.5,    // 2-3 sessions/week  
    good: 4,      // 3-4 sessions/week
    excellent: 5  // 4+ sessions/week
  };

  // Age adjustment factors based on longitudinal studies
  private ageAdjustmentFactors: { [ageRange: string]: number } = {
    '18-25': 1.0,
    '26-35': 0.95,
    '36-45': 0.88,
    '46-55': 0.80,
    '56-65': 0.70,
    '65+': 0.60
  };

  /**
   * Calculate strength percentile based on real-world data
   */
  calculateStrengthPercentile(
    exercise: string,
    weight: number,
    userProfile: UserProfile
  ): number {
    const standards = this.strengthStandards[exercise];
    if (!standards) return 50; // Default if exercise not found

    const genderStandards = standards[userProfile.gender] || standards.male;
    const bodyweight = userProfile.weight;
    const ageGroup = this.getAgeGroup(userProfile.age);
    const ageAdjustment = this.ageAdjustmentFactors[ageGroup] || 1.0;

    // Calculate relative strength (weight lifted / bodyweight)
    const relativeStrength = weight / bodyweight;
    
    // Apply age adjustment
    const adjustedRelativeStrength = relativeStrength / ageAdjustment;

    // Determine percentile based on standards
    if (adjustedRelativeStrength <= genderStandards.beginner) return 10;
    if (adjustedRelativeStrength <= genderStandards.novice) return 30;
    if (adjustedRelativeStrength <= genderStandards.intermediate) return 60;
    if (adjustedRelativeStrength <= genderStandards.advanced) return 85;
    if (adjustedRelativeStrength <= genderStandards.elite) return 95;
    return 99; // Above elite level
  }

  /**
   * Calculate training volume percentile
   */
  calculateVolumePercentile(weeklyVolume: number, userProfile: UserProfile): number {
    // Convert total volume to sets per week (approximate)
    const avgWeightPerSet = 50; // Rough estimate
    const avgRepsPerSet = 8;
    const estimatedSets = weeklyVolume / (avgWeightPerSet * avgRepsPerSet);

    if (estimatedSets <= this.volumeStandards.lowVolume) return 25;
    if (estimatedSets <= this.volumeStandards.moderateVolume) return 60;
    if (estimatedSets <= this.volumeStandards.highVolume) return 85;
    return 95; // Very high volume
  }

  /**
   * Calculate consistency percentile based on training frequency
   */
  calculateConsistencyPercentile(weeklyFrequency: number): number {
    if (weeklyFrequency <= this.frequencyStandards.poor) return 20;
    if (weeklyFrequency <= this.frequencyStandards.fair) return 45;
    if (weeklyFrequency <= this.frequencyStandards.good) return 75;
    if (weeklyFrequency <= this.frequencyStandards.excellent) return 90;
    return 95; // Exceptional consistency
  }

  /**
   * Get comprehensive comparison data for user
   */
  getComprehensiveComparison(userProfile: UserProfile, workoutData: {
    maxBench?: number;
    maxSquat?: number;
    maxDeadlift?: number;
    weeklyVolume: number;
    weeklyFrequency: number;
  }) {
    const strengthPercentiles = {
      bench: workoutData.maxBench ? this.calculateStrengthPercentile('Bench Press', workoutData.maxBench, userProfile) : null,
      squat: workoutData.maxSquat ? this.calculateStrengthPercentile('Squat', workoutData.maxSquat, userProfile) : null,
      deadlift: workoutData.maxDeadlift ? this.calculateStrengthPercentile('Deadlift', workoutData.maxDeadlift, userProfile) : null,
    };

    const volumePercentile = this.calculateVolumePercentile(workoutData.weeklyVolume, userProfile);
    const consistencyPercentile = this.calculateConsistencyPercentile(workoutData.weeklyFrequency);

    // Calculate overall percentile (weighted average)
    const validStrengthPercentiles = Object.values(strengthPercentiles).filter(p => p !== null) as number[];
    const avgStrengthPercentile = validStrengthPercentiles.length > 0 
      ? validStrengthPercentiles.reduce((sum, p) => sum + p, 0) / validStrengthPercentiles.length 
      : 50;

    const overallPercentile = Math.round(
      (avgStrengthPercentile * 0.5) + (volumePercentile * 0.2) + (consistencyPercentile * 0.3)
    );

    return {
      strengthPercentiles,
      volumePercentile,
      consistencyPercentile,
      overallPercentile,
      demographic: {
        ageGroup: this.getAgeGroup(userProfile.age),
        weightClass: this.getWeightClass(userProfile.weight, userProfile.gender),
        experienceLevel: userProfile.experienceLevel,
        sampleSize: this.getEstimatedSampleSize(userProfile) // Estimated based on demographic
      }
    };
  }

  private getAgeGroup(age: number): string {
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 45) return '36-45';
    if (age <= 55) return '46-55';
    if (age <= 65) return '56-65';
    return '65+';
  }

  private getWeightClass(weight: number, gender: string): string {
    if (gender === 'male') {
      if (weight <= 65) return '<65kg';
      if (weight <= 75) return '65-75kg';
      if (weight <= 85) return '75-85kg';
      if (weight <= 95) return '85-95kg';
      return '95kg+';
    } else {
      if (weight <= 50) return '<50kg';
      if (weight <= 60) return '50-60kg';
      if (weight <= 70) return '60-70kg';
      if (weight <= 80) return '70-80kg';
      return '80kg+';
    }
  }

  private getEstimatedSampleSize(userProfile: UserProfile): number {
    // Estimated sample sizes based on demographic popularity in strength training
    const baseSize = 10000;
    let multiplier = 1.0;

    // Age adjustments (younger demographics more represented)
    if (userProfile.age <= 30) multiplier *= 1.5;
    else if (userProfile.age >= 50) multiplier *= 0.6;

    // Gender adjustments (males more represented in strength training data)
    if (userProfile.gender === 'male') multiplier *= 1.3;

    // Experience level adjustments
    if (userProfile.experienceLevel === 'intermediate') multiplier *= 1.2;
    else if (userProfile.experienceLevel === 'beginner') multiplier *= 0.8;

    return Math.round(baseSize * multiplier);
  }

  /**
   * Get motivational message based on percentile
   */
  getMotivationalMessage(percentile: number, category: string): string {
    if (percentile >= 90) {
      return `Outstanding ${category}! You're in the top 10% of lifters.`;
    } else if (percentile >= 75) {
      return `Great ${category}! You're stronger than most gym-goers.`;
    } else if (percentile >= 50) {
      return `Solid ${category}! You're making good progress.`;
    } else if (percentile >= 25) {
      return `Keep building your ${category}! Lots of room to grow.`;
    } else {
      return `Early stages of ${category} development. Stay consistent!`;
    }
  }
}

export const strengthStandardsService = new StrengthStandardsService(); 