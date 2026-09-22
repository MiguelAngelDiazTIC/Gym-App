export interface Profile {
  id: string
  name: string
  photo?: string // base64
}

export interface WeightEntry {
  id: string
  profileId: string
  weight: number
  date: string // ISO string
}

export interface Exercise {
  id: string
  name: string
}

export interface WorkoutDay {
  id: string
  name: string
  exercises: Exercise[]
}

export interface Routine {
  id: string
  profileId: string
  name: string
  days: WorkoutDay[]
}

export interface RoutineWeek {
  id: string
  profileId: string
  routineId: string
  index: number
  createdAt: string // ISO string
}

export interface SetEntry {
  id?: string // absent on sets created before exit-animation support
  reps: number
  weight: number
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetEntry[]
}

export interface WorkoutLog {
  id: string
  profileId: string
  routineId: string
  weekId: string
  dayId: string
  date: string
  exercises: ExerciseLog[]
}

export interface MacroEntry {
  id?: string // absent on items created before exit-animation support
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra'
  items: MacroEntry[]
}

export interface NutritionDay {
  id: string
  profileId: string
  date: string
  meals: Meal[]
}